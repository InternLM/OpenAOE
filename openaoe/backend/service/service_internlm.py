import json

import requests
from fastapi.encoders import jsonable_encoder
from sse_starlette.sse import EventSourceResponse

from openaoe.backend.config.biz_config import get_base_url
from openaoe.backend.config.constant import *
from openaoe.backend.model.aoe_response import AOEResponse
from openaoe.backend.model.internlm import InternlmChatCompletionBody
from openaoe.backend.util.log import log

logger = log(__name__)


def chat_completion_v1(request, body: InternlmChatCompletionBody):
    messages = body.messages
    msgs = []
    for msg in messages:
        if msg.sender_type == "bot":
            msg.sender_type = body.role_meta.bot_name
        msg_item = {
            "role": msg.sender_type,
            "content": jsonable_encoder(msg.text),
        }
        msgs.append(msg_item)
    msg_item = {
        "role": "user",
        "content": body.prompt
    }
    msgs.append(msg_item)
    # restful api
    url = get_base_url(PROVIDER_INTERNLM, body.model) + "/v1/chat/completions"
    headers = {
        'accept': 'application/json',
        'Content-Type': 'application/json'
    }
    data = {
        "model": body.model,
        "messages": msgs,
        "temperature": body.temperature,
        "top_p": body.top_p,
        "n": body.n,
        "max_tokens": body.max_tokens,
        "stream": body.stream,
        "presence_penalty": body.presence_penalty,
        "frequency_penalty": body.frequency_penalty,
        "user": "string",
        "repetition_penalty": 1,
        "session_id": -1,
        "ignore_eos": False
    }
    if body.stream:
        return chat_completion_stream_v1(request, url, headers, data)
    else:
        res = requests.post(url, headers=headers, json=data)
        if res and res.status_code == 200:
            return AOEResponse(
                data=res.json()
            )
        else:
            return AOEResponse(
                data="request failed"
            )


def chat_completion_stream_v1(request, url, headers, data):
    # retry times
    count = 3

    async def event_generator_json(count: int):
        while count > 0:
            count -= 1
            stop_flag = False
            if await request.is_disconnected():
                break
            try:
                res = requests.post(url, headers=headers, json=data, stream=True)
                logger.debug(f"url={url}, headers={headers}, body={data}")
                if res:
                    for chunk in res.iter_content(chunk_size=512, decode_unicode=True):
                        logger.debug(f"chunk: {chunk}")
                        res_data = chunk.replace("data: ", "")
                        try:
                            json_data = json.loads(res_data)
                            logger.debug(f"json_data: {json_data}")
                            if json_data.get("object") == "error":
                                error_msg = json_data.get("message")
                                dict_item = {
                                    "success": "true",
                                    "msg": f"LMDeploy: {error_msg} "
                                }
                                yield json.dumps(dict_item, ensure_ascii=False)
                                stop_flag = True
                            choices = json_data.get("choices")
                            if not choices:
                                continue
                            choice = choices[0]
                            if choice.get('finish_reason'):
                                stop_flag = True
                            if 'content' not in choice['delta']:
                                continue
                            s = choice["delta"]["content"]
                            logger.debug(f"content={s}")
                            if s:
                                dict_item = {
                                    "success": "true",
                                    "msg": s
                                }
                                yield json.dumps(dict_item, ensure_ascii=False)
                            if stop_flag:
                                break
                        except Exception as e:
                            logger.error(f"Error: {e}")
                    if stop_flag:
                        break
            except Exception as e:
                logger.error(f"{e}")
                yield json.dumps({
                    "success": "false",
                    "msg": f"from backend: {str(e)}"
                })
                break

    return EventSourceResponse(event_generator_json(count))
