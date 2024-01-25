import json

import requests
from sse_starlette.sse import EventSourceResponse

from openaoe.backend.config.biz_config import get_model_configuration, get_base_url
from openaoe.backend.config.constant import *
from openaoe.backend.model.minimax import MinimaxChatCompletionBody
from openaoe.backend.util.log import log

logger = log(__name__)


def _get_req_param(body):
    group_id = get_model_configuration(PROVIDER_MINIMAX, "group_id", body.model)
    jwt = get_model_configuration(PROVIDER_MINIMAX, "jwt", body.model)
    api_base = get_base_url(PROVIDER_MINIMAX, body.model)
    headers = {
        "Authorization": jwt,
        "Content-Type": "application/json"
    }
    role_meta = {
        "user_name": body.role_meta.user_name,
        "bot_name": body.role_meta.bot_name
    }
    messages = [
        {"sender_type": msg.sender_type, "text": msg.text}
        for msg in body.messages or []
    ]

    payload = {
        "model": body.model,
        "prompt": body.prompt,
        "role_meta": role_meta,
        "messages": messages,
        "stream": body.stream,
        "tokens_to_generate": 4096
    }
    url = f'{api_base}/v1/text/chatcompletion?GroupId={group_id}'
    return url, headers, payload


def _parse_chunk_delta(chunk):
    if not chunk:
        return "empty received"
    decoded_data = chunk.decode('utf-8')
    parsed_data = json.loads(decoded_data.replace("data:", ""))
    choices = parsed_data['choices']
    if choices is None:
        base_resp = parsed_data['base_resp']
        if base_resp is None:
            return parsed_data
        # sts_code = base_resp.get('status_code')
        sts_msg = base_resp.get('status_msg')
        return f"{sts_msg}"
    delta_content = choices[0]['delta']
    return delta_content


def _should_stop(chunk) -> bool:
    if not chunk:
        return True
    decoded_data = chunk.decode('utf-8')
    parsed_data = json.loads(decoded_data.replace("data:", ""))
    choices = parsed_data['choices']
    if choices is None:
        return True
    finish_reason = choices[0].get("finish_reason")
    if finish_reason is None or finish_reason == "":
        return False
    return True


def minimax_chat_stream_svc(request, body: MinimaxChatCompletionBody):
    """
    chat stream logic for Minimax
    return format determines by body.type
    """

    async def event_generator():
        url, headers, payload = _get_req_param(body)

        while True:
            stop_flag = False
            if await request.is_disconnected():
                break
            try:
                response = requests.post(url=url, headers=headers, json=payload)
                for chunk in response.iter_lines():
                    if _should_stop(chunk):
                        stop_flag = True
                        yield _parse_chunk_delta(chunk)
                        break
                    if chunk:
                        yield _parse_chunk_delta(chunk)
            except Exception as e:
                logger.error(f"{e}")
                stop_flag = True
                yield str(e)
            if stop_flag:
                break

    async def event_generator_json():
        url, headers, payload = _get_req_param(body)
        while True:
            stop_flag = False
            if await request.is_disconnected():
                break
            try:
                response = requests.post(url=url, headers=headers, json=payload)
                for chunk in response.iter_lines():
                    dict_item = {
                        "success": "true",
                        "msg": _parse_chunk_delta(chunk)
                    }
                    yield json.dumps(dict_item, ensure_ascii=False)
                    if _should_stop(chunk):
                        stop_flag = True
                        break
                if stop_flag:
                    break
            except Exception as e:
                logger.error(f"{e}")
                dict_item = {
                    "success": "false",
                    "msg": str(e)
                }
                yield json.dumps(dict_item)
                break

    if body.type == "text":
        return EventSourceResponse(event_generator())
    elif body.type == "json":
        return EventSourceResponse(event_generator_json())
