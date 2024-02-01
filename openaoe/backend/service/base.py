#! /bin/python3
import json
import sys
import traceback
from io import StringIO

import httpx
from fastapi.encoders import jsonable_encoder
from jsonstreamer import ObjectStreamer

from openaoe.backend.config.constant import DEFAULT_TIMEOUT_SECONDS
from openaoe.backend.model.aoe_response import AOEResponse
from openaoe.backend.util.log import log

logger = log(__name__)


async def base_request(provider, url, method: str, headers: dict, body=None, timeout=DEFAULT_TIMEOUT_SECONDS,
                       params=None,
                       files=None) -> AOEResponse:
    response = AOEResponse()

    headers_pure = {}
    for k, v in headers:
        k = k.lower()
        if k == "user-agent" or k == "host" or "ip" in k:
            continue
        headers_pure[k] = v

    body_str = body
    if "content-type" in headers and "multipart/form-data" in headers["content-type"]:
        body_str = "image"
    if len(body_str) > 200:
        body_str = body_str[:200]

    try:
        async with httpx.AsyncClient() as client:
            proxy = await client.request(method, url, headers=headers, json=body, timeout=timeout,
                                         params=params, files=files)
        response.data = proxy.content
        try:
            response.data = json.loads(response.data)
        except:
            response.data = proxy.content

    except Exception as e:
        response.msg = str(e)
        logger.error(f"[{provider}] url: {url}, method: {method}, headers: {jsonable_encoder(headers)}, "
                     f"body: {body_str} failed, response: {jsonable_encoder(response)}")
    return response


async def base_stream(provider, url, method: str, headers: dict, stream_callback, body=None,
                      timeout=DEFAULT_TIMEOUT_SECONDS,
                      params=None,
                      files=None):
    headers_pure = {
        "Content-Type": "application/json"
    }
    for k, v in headers:
        k = k.lower()
        if k == "user-agent" or k == "host" or "ip" in k:
            continue
        headers_pure[k] = v

    body_str = jsonable_encoder(body)
    if "content-type" in headers and "multipart/form-data" in headers["content-type"]:
        body_str = "image"
    if len(body_str) > 200:
        body_str = body_str[:200]

    try:
        with httpx.stream(method, url, json=body, params=params, files=files, headers=headers_pure,
                          timeout=timeout) as res:
            # stream parser
            streamer = ObjectStreamer()
            sys.stdout = mystdout = StringIO()
            streamer.add_catch_all_listener(stream_callback)

            for text in res.iter_text():
                streamer.consume(text)
                yield mystdout.getvalue()
                # clear printed string
                sys.stdout.seek(0)
                sys.stdout.truncate()

    except Exception as e:
        print(traceback.format_exc())
        response = AOEResponse()
        response.msg = str(e)
        logger.error(f"[{provider}] url: {url}, method: {method}, headers: {jsonable_encoder(headers_pure)}, "
                     f"body: {body_str} failed, response: {jsonable_encoder(response)}")
        yield response
