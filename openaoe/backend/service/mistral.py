import json

import requests
from fastapi import Request, Response
from sse_starlette import EventSourceResponse

from openaoe.backend.config.biz_config import get_base_url
from openaoe.backend.config.constant import PROVIDER_MISTRAL
from openaoe.backend.model.openaoe import AoeChatBody
from openaoe.backend.model.mistral import MistralChatBody, Message

from openaoe.backend.util.log import log
logger = log(__name__)


class Mistral:
    def __init__(self, request: Request, response: Response):
        self.request = request
        self.response = response

    async def chat(self, body: AoeChatBody):
        msgs = []
        for msg in body.messages:
            m = Message(role=msg.sender_type if msg.sender_type != 'bot' else "assistant", content=msg.text)
            msgs.append(m)
        last_m = Message(role='user', content=body.prompt)
        msgs.append(last_m)
        chat_url = get_base_url(PROVIDER_MISTRAL, body.model) + "/api/chat"
        chat_body = MistralChatBody(
            model="mistral",
            messages=msgs
        )
        return self.chat_response_streaming(chat_url, chat_body)

    def chat_response_streaming(self, chat_url: str, chat_body: MistralChatBody):
        async def do_response_streaming():
            try:
                res = requests.post(chat_url, json=json.loads(chat_body.model_dump_json()), stream=True)
                if res:
                    for chunk in res.iter_content(chunk_size=512, decode_unicode=True):
                        chunk = bytes.decode(chunk)
                        logger.info(f"chunk: {chunk}")
                        chunk_json = json.loads(chunk)
                        yield json.dumps({
                            "success": True,
                            "msg": chunk_json.get("message").get("content")
                        }, ensure_ascii=False)
            except Exception as e:
                logger.error(f"{e}")
                yield json.dumps(
                    {
                        "success": "false",
                        "msg": f"from backend: {e}"
                    }
                )

        return EventSourceResponse(do_response_streaming())




