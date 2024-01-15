import json

import requests
from fastapi import Request

from openaoe.backend.config.biz_config import get_api_key, get_base_url
from openaoe.backend.config.constant import *
from openaoe.backend.model.aoe_response import AOEResponse
from openaoe.backend.model.google import GooglePalmChatBody
from openaoe.backend.util.log import log


logger = log(__name__)


def doRequest(url, body):
    try:
        response_json = requests.post(
            url=url,
            data=json.dumps(body)
        ).json()
        if response_json.get('error') is not None:
            err_msg = response_json.get('error').get("message")
            base = AOEResponse(
                msg="error",
                msgCode="-1",
                data=err_msg
            )
            return base

        # remove messages
        if response_json and response_json.get("messages"):
            response_json.pop("messages")
        base = AOEResponse(
            data=response_json
        )
    except Exception as e:
        logger.error(f"{e}")
        base = AOEResponse(
            msg="error",
            msgCode="-1",
            data=str(e)
        )
    return base


def palm_chat_svc(request: Request, req_dto: GooglePalmChatBody):
    api_key = get_api_key(VENDOR_GOOGLE)
    url = get_base_url(VENDOR_GOOGLE)
    url = f"{url}/google/v1beta2/models/{req_dto.model}:generateMessage?key={api_key}"
    messages = [
        {"content": msg.content, "author": msg.author}
        for msg in req_dto.prompt.messages or []
    ]
    body = {
        "prompt": {
            "messages": messages
        },
        "temperature": req_dto.temperature,
        "candidate_count": req_dto.candidate_count,
        "model": req_dto.model
    }
    return doRequest(url, body)
