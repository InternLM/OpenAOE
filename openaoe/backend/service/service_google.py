from jsonstreamer import ObjectStreamer
from sse_starlette import EventSourceResponse

from openaoe.backend.config.biz_config import get_api_key, get_base_url
from openaoe.backend.config.constant import *
from openaoe.backend.model.aoe_response import AOEResponse
from openaoe.backend.model.google import GooglePalmChatBody
from openaoe.backend.service.base import base_request, base_stream
from openaoe.backend.util.log import log

logger = log(__name__)


async def palm_chat_svc(body: GooglePalmChatBody):
    """
    chat logic for google PaLM model
    """
    url, params, request_body = _construct_request_data(body)

    if "gemini" in body.model:
        return EventSourceResponse(
            base_stream(PROVIDER_GOOGLE, url, "post", {}, _catch_all, body=request_body, params=params))

    try:
        response = await base_request(PROVIDER_GOOGLE, url, "post", {}, request_body, params=params)
        response_json = response.data
        if response_json.get('error') is not None:
            err_msg = response_json.get('error').get("message")
            return AOEResponse(
                msg="error",
                msgCode="-1",
                data=err_msg
            )

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


def _construct_request_data(body: GooglePalmChatBody):
    model = body.model
    api_base = get_base_url(PROVIDER_GOOGLE, body.model)
    api_key = get_api_key(PROVIDER_GOOGLE, body.model)

    if "gemini" in model:
        # specially process gemini request
        url = f"{api_base}/v1beta/models/{model}:streamGenerateContent"
        params = {
            "key": api_key
        }

        if body.prompt.messages[0].author == "1":
            body.prompt.messages = body.prompt.messages[1:]
        contents = [
            {
                "role": "user" if msg.author == "0" else "model",
                "parts": [{
                    "text": msg.content
                }]
            }
            for msg in body.prompt.messages
        ]
        body = {
            "contents": contents,
            "generationConfig": {
                "temperature": body.temperature,
                "candidateCount": 1
            }
        }
    else:
        url = f"{api_base}/v1beta2/models/{model}:generateMessage?key={api_key}"
        params = {
            "key": api_key
        }

        messages = []
        last_author = ""
        # ignore not answered prompt
        for item in body.prompt.messages:
            if item.author == last_author:
                messages.pop()
            messages.append({"content": item.content, "author": item.author})
            last_author = item.author
        body = {
            "prompt": {
                "messages": messages
            },
            "temperature": body.temperature,
            "candidate_count": body.candidate_count,
            "model": body.model
        }
    return url, params, body


def _catch_all(event_name, *args):
    if event_name == ObjectStreamer.PAIR_EVENT and args[0] == "text":
        print(args[1])
        return

    elif event_name != ObjectStreamer.ELEMENT_EVENT:
        return

    for item in args:
        try:
            text = item["candidates"][0]["content"]["parts"][0]["text"]
            print(text)
        except:
            logger.warning(f"parse error, raw: {item}")
