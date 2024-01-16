import json

from openai import OpenAI
from sse_starlette.sse import EventSourceResponse

from openaoe.backend.config.biz_config import get_api_key, get_base_url
from openaoe.backend.config.constant import *
from openaoe.backend.model.aoe_response import AOEResponse
from openaoe.backend.util.log import log

logger = log(__name__)


def _messages_process(req_dto):
    prompt = req_dto.prompt
    contexts = req_dto.messages
    role_meta = req_dto.role_meta
    if role_meta is not None:
        user_name = role_meta.user_name
        bot_name = role_meta.bot_name
    else:
        user_name = "user"
        bot_name = "assistant"
    messages = [
                   {
                       "role": "user" if user_name == "user" else bot_name,
                       "content": context.text
                   }
                   for context in contexts or []
               ] + [
                   {
                       "role": "user",
                       "content": prompt
                   }]
    return messages


def chat_completion_stream(request, body):
    """
    stream logic for OpenAI model
    return format determines by body.type
    """
    async def event_generator():
        while True:
            client = OpenAI(
                api_key=get_api_key(VENDOR_OPENAI),
                timeout=body.timeout,
                base_url=get_base_url(VENDOR_OPENAI)
            )

            stop_flag = False
            response = ""
            if await request.is_disconnected():
                break
            try:
                res = client.chat.completions.with_raw_response.create(
                    model=body.model,
                    messages=_messages_process(body),
                    temperature=body.temperature,
                    stream=True,
                    timeout=body.timeout
                )

                for chunk in res.parse():
                    choice = chunk.choices[0]
                    s = choice.delta.content
                    if choice.finish_reason:
                        stop_flag = True
                    if s:
                        response += s
                        yield s
                    if stop_flag:
                        break
                if stop_flag:
                    break
            except Exception as e:
                yield str(e)
                break

    async def event_generator_json():
        while True:
            client = OpenAI(
                api_key=get_api_key(VENDOR_OPENAI),
                timeout=body.timeout,
                base_url=get_base_url(VENDOR_OPENAI)
            )
            stop_flag = False
            response = ""
            if await request.is_disconnected():
                break
            res = None
            try:
                res = client.chat.completions.with_raw_response.create(
                    model=body.model,
                    messages=_messages_process(body),
                    temperature=body.temperature,
                    stream=True,
                    timeout=body.timeout
                )

                for chunk in res.parse():
                    choice = chunk.choices[0]
                    s = choice.delta.content
                    if choice.finish_reason:
                        stop_flag = True
                    if s:
                        response += s
                        dict_item = {
                            "success": "true",
                            "msg": s
                        }
                        yield json.dumps(dict_item, ensure_ascii=False)
                    if stop_flag:
                        break
                if stop_flag:
                    break
            except Exception as e:
                yield json.dumps({
                    "success": "false",
                    "msg": str(e)
                })
                break

    if body.type == 'text':
        return EventSourceResponse(event_generator())
    elif body.type == 'json':
        return EventSourceResponse(event_generator_json())
    else:
        return AOEResponse(
            msg=f"invalid type: {body.type}",
            msgCode="-1"
        )
