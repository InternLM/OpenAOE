import json

import requests
from fastapi.encoders import jsonable_encoder
from sse_starlette.sse import EventSourceResponse

from openaoe.backend.config.biz_config import get_base_url
from openaoe.backend.config.constant import *
from openaoe.backend.model.internlm import InternlmChatCompletionBody
from openaoe.backend.model.aoe_response import AOEResponse
from openaoe.backend.util.log import log

logger = log(__name__)


def chat_completion_v1(request, req_dto: InternlmChatCompletionBody):
    messages = req_dto.messages
    msgs = []
    for msg in messages:
        if msg.sender_type == "bot":
            msg.sender_type = req_dto.role_meta.bot_name
        msg_item = {
            "role": msg.sender_type,
            "content": jsonable_encoder(msg.text),
        }
        msgs.append(msg_item)
    msg_item = {
        "role": "user",
        "content": req_dto.prompt
    }
    msgs.append(msg_item)
    # restful api
    url = get_base_url(VENDOR_INTERNLM) + "/v1/chat/completions"
    headers = {
        'accept': 'application/json',
        'Content-Type': 'application/json'
    }
    data = {
        "model": req_dto.model,
        "messages": msgs,
        "temperature": req_dto.temperature,
        "top_p": req_dto.top_p,
        "n": req_dto.n,
        "max_tokens": req_dto.max_tokens,
        "stop": False,
        "stream": req_dto.stream,
        "presence_penalty": req_dto.presence_penalty,
        "frequency_penalty": req_dto.frequency_penalty,
        "user": "string",
        "repetition_penalty": 1,
        "session_id": -1,
        "ignore_eos": False
    }
    if req_dto.stream:
        return chat_completion_stream_v1(request, url, headers, data)
    else:
        res = requests.post(url, headers=headers, json=data)
        if res and res.status_code == 200:
            base = AOEResponse(
                data=res.json()
            )
            return base
        else:
            return AOEResponse(
                data="request failed"
            )


def chat_completion_stream_v1(request, url, headers, data):
    async def event_generator_json():
        while True:
            stop_flag = False
            response = ""
            if await request.is_disconnected():
                break
            try:
                res = requests.post(url, headers=headers, json=data)
                res_data = res.text.replace("data: ", "")
                json_strings = res_data.split("\n\n")
                # 解析 JSON 数据
                for chunk in json_strings:
                    try:
                        json_data = json.loads(chunk)
                        choice = json_data["choices"][0]
                        if choice['finish_reason']:
                            stop_flag = True
                        if 'content' not in choice['delta']:
                            continue
                        s = choice["delta"]["content"]
                        if s:
                            response += s
                            dict_item = {
                                "success": "true",
                                "msg": s
                            }
                            yield json.dumps(dict_item, ensure_ascii=False)
                        if stop_flag:
                            break
                    except json.JSONDecodeError as e:
                        print(f"JSON Parse Error: {e}")

                if stop_flag:
                    break
            except Exception as e:
                yield json.dumps({
                    "success": "false",
                    "msg": str(e)
                })
                break

    return EventSourceResponse(event_generator_json())


if __name__ == "__main__":
    pass
