import json

import requests
from bardapi import Bard
from fastapi import Request
from fastapi.encoders import jsonable_encoder

from openaoe.backend.config.biz_config import get_api_key, get_base_url
from openaoe.backend.config.constant import *
from openaoe.backend.model.google import GooglePalmChatBody, GooglePalmTextBody, GoogleBardAskImgBody, \
    GoogleSafetySetting
from openaoe.backend.model.aoe_response import AOEResponse
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
    logger.info(f"proxy-server={url}")
    url = f"{url}/{req_dto.model}:generateMessage?key={api_key}"
    messages = []
    for message in req_dto.prompt.messages:
        item = {
            "content": message.content,
            "author": message.author
        }
        messages.append(item)
    body = {
        "prompt": {
            "messages": messages
        },
        "temperature": req_dto.temperature,
        "candidate_count": req_dto.candidate_count,
        "model": req_dto.model
    }
    return doRequest(url, body)


def palm_text_svc(request, req_dto: GooglePalmTextBody):
    api_key = get_api_key(VENDOR_GOOGLE)
    url = get_base_url(VENDOR_GOOGLE)
    url = f"{url}/{req_dto.model}:generateText?key={api_key}"

    ss = get_default_safety_settings()
    if len(req_dto.safety_settings) > 0:
        ss = req_dto.safety_settings
    body = {
        "prompt": {
            "text": req_dto.prompt.text
        },
        "temperature": req_dto.temperature,
        "candidate_count": req_dto.candidate_count,
        "max_output_tokens": req_dto.max_output_tokens,
        "safety_settings": jsonable_encoder(ss),
    }
    return doRequest(url, body)


def bard_ask_img_svc(req_dto: GoogleBardAskImgBody):
    img_url = req_dto.img_url
    prompt = req_dto.prompt
    bard_token = req_dto.bard_token
    img = requests.get(img_url).content

    try:
        bard = Bard(token=bard_token)
        result = bard.ask_about_image(input_text=prompt, image=img)
        return AOEResponse(
            data=result
        )
    except Exception as e:
        logger.error(f"{e}")
        return AOEResponse(
            msg="error",
            msgCode="-1",
            data=str(e)
        )


def get_default_safety_settings():
    s = GoogleSafetySetting()
    s.category = "HARM_CATEGORY_UNSPECIFIED"
    s.threshold = "BLOCK_NONE"
    return [s]


if __name__ == "__main__":
    pass
