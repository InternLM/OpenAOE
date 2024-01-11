import json

import requests
from fastapi import Request
from sse_starlette.sse import EventSourceResponse

from ..config.biz_config import get_model_configuration, get_base_url
from ..config.constant import *
from ..model.dto.MinimaxDto import MinimaxChatCompletionReqDto
from ..model.dto.ReturnBase import ReturnBase
from ..util.log import log

logger = log(__name__)


def get_req_param(request, req_dto):
    group_id = get_model_configuration(VENDOR_MINIMAX, "group_id")
    jwt = get_model_configuration(VENDOR_MINIMAX, "jwt")
    api_url = get_base_url(VENDOR_MINIMAX)
    headers = {
        "Authorization": jwt,
        "Content-Type": "application/json"
    }
    role_meta = {
        "user_name": req_dto.role_meta.user_name,
        "bot_name": req_dto.role_meta.bot_name
    }
    messages = []
    for msg in req_dto.messages:
        message = {
            "sender_type": msg.sender_type,
            "text": msg.text
        }
        messages.append(message)

    payload = {
        "model": req_dto.model,
        "prompt": req_dto.prompt,
        "role_meta": role_meta,
        "messages": messages,
        "stream": req_dto.stream,
        "tokens_to_generate": 4096
    }
    url = f'{api_url}{group_id}'
    return url, headers, payload


def chat_completion(request: Request, req_dto: MinimaxChatCompletionReqDto):
    url, headers, payload = get_req_param(request, req_dto)
    try:
        response = requests.post(url=url, headers=headers, json=payload)
        base = ReturnBase(
            data=response.json()
        )
    except Exception as e:
        logger.error(f"{e}")
        base = ReturnBase(
            msg="error",
            msgCode="-1",
            data=str(e)
        )
    return base


def parse_chunk_delta(chunk):
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


def should_stop(chunk) -> bool:
    if not chunk:
        return True
    decoded_data = chunk.decode('utf-8')
    # logger.info(f"decoded_data={decoded_data}")
    parsed_data = json.loads(decoded_data.replace("data:", ""))
    choices = parsed_data['choices']
    if choices is None:
        return True
    finish_reason = choices[0].get("finish_reason")
    # logger.info(f"finish_reason={finish_reason}")
    if finish_reason is None or finish_reason == "":
        return False
    return True


def minimax_chat_stream_svc(request, req_dto: MinimaxChatCompletionReqDto):
    async def event_generator():
        url, headers, payload = get_req_param(request, req_dto)

        while True:
            stop_flag = False
            if await request.is_disconnected():
                break
            try:
                response = requests.post(url=url, headers=headers, json=payload)
                for chunk in response.iter_lines():
                    if should_stop(chunk):
                        stop_flag = True
                        yield parse_chunk_delta(chunk)
                        break
                    if chunk:
                        yield parse_chunk_delta(chunk)
            except Exception as e:
                logger.error(f"{e}")
                stop_flag = True
                yield str(e)
            if stop_flag:
                break

    async def event_generator_json():
        url, headers, payload = get_req_param(request, req_dto)
        while True:
            stop_flag = False
            if await request.is_disconnected():
                logger.info("connection closed by request")
                break
            try:
                response = requests.post(url=url, headers=headers, json=payload)
                for chunk in response.iter_lines():
                    dict_item = {
                        "success": "true",
                        "msg": parse_chunk_delta(chunk)
                    }
                    yield json.dumps(dict_item, ensure_ascii=False)
                    if should_stop(chunk):
                        stop_flag = True
                        logger.info("connection closed by should_stop")
                        break
                if stop_flag:
                    break
            except Exception as e:
                logger.error(f"{e}")
                logger.info("connection closed by exception")
                dict_item = {
                    "success": "false",
                    "msg": str(e)
                }
                yield json.dumps(dict_item)
                break

    if req_dto.type == "text":
        return EventSourceResponse(event_generator())
    elif req_dto.type == "json":
        return EventSourceResponse(event_generator_json())


if __name__ == "__main__":
    pass
