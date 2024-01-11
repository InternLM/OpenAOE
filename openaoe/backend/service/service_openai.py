import json

import httpx
from fastapi import Request
from fastapi.encoders import jsonable_encoder
from openai import OpenAI
from sse_starlette.sse import EventSourceResponse

from ..config.biz_config import get_api_key, get_base_url
from ..config.constant import *
from ..model.dto.OpenaiDto import OpenaiChatCompletionReqDto, OpenaiCompletionReqDto, OpenaiChatCompletionV2ReqDto
from ..model.dto.ReturnBase import ReturnBase, ProxyReturnBase
from ..util.log import log

logger = log(__name__)


def get_req_params(req_dto, request):
    model = req_dto.model
    prompt = req_dto.prompt
    temperature = req_dto.temperature
    contexts = req_dto.messages
    role_meta = req_dto.role_meta
    if role_meta is not None:
        user_name = role_meta.user_name
        bot_name = role_meta.bot_name
    else:
        user_name = "user"
        bot_name = "assistant"
    messages = []
    if contexts is not None:
        for context in contexts:
            role = "user" if user_name == "user" else bot_name
            content = context.text
            messages.append({
                "role": role,
                "content": content
            })
    messages.append({"role": "user", "content": prompt})

    api_base = get_base_url(VENDOR_OPENAI)
    api_key = get_api_key(VENDOR_OPENAI)
    if api_key is None or api_key == "":
        logger.error(f"get api_key for model: {model} failed")
    return model, messages, temperature, api_base, api_key


def get_req_params_v2(req_dto: OpenaiChatCompletionV2ReqDto, request):
    model = req_dto.model
    messages = req_dto.messages
    temperature = req_dto.temperature
    max_tokens = req_dto.max_tokens
    top_p = req_dto.top_p
    n = req_dto.n
    presence_penalty = req_dto.presence_penalty
    frequency_penalty = req_dto.frequency_penalty
    api_base = get_base_url(VENDOR_OPENAI)
    api_key = get_api_key(VENDOR_OPENAI)
    if api_key is None or api_key == "":
        logger.error(f"get api_key for model: {model} failed")
    return model, messages, temperature, max_tokens, top_p, n, presence_penalty, frequency_penalty, api_base, api_key


def completions(request: Request, req_dto: OpenaiCompletionReqDto):
    """
    model: text-davinci-003, text-davinci-002, text-curie-001, text-babbage-001, text-ada-001
    """
    model = req_dto.model
    prompt = req_dto.prompt
    max_tokens = req_dto.max_tokens
    temperature = req_dto.temperature
    top_p = req_dto.top_p
    n = req_dto.n
    presence_penalty = req_dto.presence_penalty
    frequency_penalty = req_dto.frequency_penalty
    echo = req_dto.echo
    stop = req_dto.stop
    best_of = req_dto.best_of

    api_base = get_base_url(VENDOR_OPENAI)
    api_key = get_api_key(VENDOR_OPENAI)
    client = OpenAI(api_key=api_key, timeout=req_dto.timeout, base_url=api_base)

    res = None
    try:
        res = client.completions.with_raw_response.create(
            model=model,
            prompt=prompt,
            max_tokens=max_tokens,
            temperature=temperature,
            top_p=top_p,
            n=n,
            stop=stop,
            presence_penalty=presence_penalty,
            frequency_penalty=frequency_penalty,
            echo=echo,
            best_of=best_of,
            timeout=req_dto.timeout
        )
        base = ReturnBase(
            data=res.parse()
        )
    except Exception as e:
        return ReturnBase(
            msg="error",
            msgCode="-1",
            data=str(e)
        )
    return base


def chat_completion_svc(request: Request, req_dto: OpenaiChatCompletionV2ReqDto):
    model, messages, temperature, max_tokens, top_p, n, presence_penalty, frequency_penalty, api_base, api_key = get_req_params_v2(
        req_dto, request)
    msgs = []
    for msg in messages:
        msg_item = {
            "role": msg.role,
            "content": jsonable_encoder(msg.content),
        }
        if msg.name:
            msg_item["name"] = msg.name
        if msg.function_call:
            msg_item["function_call"] = jsonable_encoder(msg.function_call)
        msgs.append(msg_item)

    client = OpenAI(api_key=api_key, timeout=req_dto.timeout, base_url=api_base)

    res = None
    try:
        res = client.chat.completions.with_raw_response.create(
            model=model,
            messages=msgs,
            temperature=temperature,
            max_tokens=max_tokens,
            top_p=top_p,
            n=n,
            presence_penalty=presence_penalty,
            frequency_penalty=frequency_penalty,
            timeout=req_dto.timeout,
            functions=req_dto.functions,
            function_call=req_dto.function_call
        )
    except Exception as e:
        return ReturnBase(
            msg="error",
            msgCode="-1",
            data=str(e)
        )
    base = ReturnBase(
        data=res.parse()
    )
    return base


def chat_completion_stream(request, req_dto):
    async def event_generator():
        while True:
            model, messages, temperature, api_base, api_key = get_req_params(req_dto, request)

            client = OpenAI(api_key=api_key, timeout=req_dto.timeout, base_url=api_base)
            stop_flag = False
            response = ""
            if await request.is_disconnected():
                break
            res = None
            try:
                res = client.chat.completions.with_raw_response.create(
                    model=model,
                    messages=messages,
                    temperature=temperature,
                    stream=True,
                    timeout=req_dto.timeout
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
            model, messages, temperature, api_base, api_key = get_req_params(req_dto, request)
            client = OpenAI(api_key=api_key, timeout=req_dto.timeout, base_url=api_base)
            stop_flag = False
            response = ""
            if await request.is_disconnected():
                break
            res = None
            try:
                res = client.chat.completions.with_raw_response.create(
                    model=model,
                    messages=messages,
                    temperature=temperature,
                    stream=True,
                    timeout=req_dto.timeout
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
                # await asyncio.sleep(0.3)
            except Exception as e:
                yield json.dumps({
                    "success": "false",
                    "msg": str(e)
                })
                break

    if req_dto.type == 'text':
        return EventSourceResponse(event_generator())
    elif req_dto.type == 'json':
        return EventSourceResponse(event_generator_json())


async def proxy_files(request: Request):
    ret = await proxy_openai(request, "proxy-files")
    return ret


async def proxy_assistants(request: Request):
    ret = await proxy_openai(request, "proxy-assistants")
    return ret


async def proxy_threads(request: Request):
    ret = await proxy_openai(request, "proxy-threads")
    return ret


async def proxy_messages(request: Request):
    ret = await proxy_openai(request, "proxy-messages")
    return ret


async def proxy_runs(request: Request):
    ret = await proxy_openai(request, "proxy-runs")
    return ret


async def proxy_openai(request: Request, vendor_prefix):
    api_base = get_base_url(VENDOR_OPENAI)
    cur_path = request.url.path.replace("/v1/openai/v1", "")
    url = f"{api_base}{cur_path}"

    headers = {}
    for k, v in request.headers.items():
        k = k.lower()
        if k == "user-agent" or k == "host" or "ip" in k:
            continue
        headers[k] = v

    method = request.method
    body = await request.body()

    body_str = body
    if "content-type" in headers and "multipart/form-data" in headers["content-type"]:
        body_str = "image"

    response = ProxyReturnBase()
    api_key = get_api_key(VENDOR_OPENAI)

    headers["Authorization"] = f"Bearer {api_key}"

    timeout = DEFAULT_TIMEOUT_SECONDS
    if not timeout and len(headers.get("timeout")) > 0:
        timeout = int(headers.get("timeout"))

    try:
        async with httpx.AsyncClient() as client:
            proxy = await client.request(method, url, headers=headers, content=body, timeout=timeout,
                                         params=request.query_params, files=await request.form())
        response.body = proxy.content
        try:
            response.body = json.loads(response.body)
        except:
            pass
        response.statusCode = proxy.status_code
        if proxy.headers:
            for k, v in proxy.headers.items():
                response.headers[k] = v

        response_str = ""
        try:
            response_str = jsonable_encoder(response)
        except:
            pass
        logger.info(f"[{vendor_prefix}] url: {url}, method: {method}, headers: {jsonable_encoder(headers)}, "
                    f"body: {body_str} success, response: {response_str}")

    except Exception as e:
        response.msg = str(e)
        logger.error(f"[{vendor_prefix}] url: {url}, method: {method}, headers: {jsonable_encoder(headers)}, "
                     f"body: {body_str} failed, response: {jsonable_encoder(response)}")
    return response


if __name__ == "__main__":
    pass
