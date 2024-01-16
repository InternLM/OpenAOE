from fastapi import APIRouter, Request

from openaoe.backend.model.openai import OpenaiChatStreamBody
from openaoe.backend.service.service_openai import chat_completion_stream

router = APIRouter()


@router.post("/v1/text/chat-stream", tags=["OpenAI"])
async def openai_chat_stream(request: Request, body: OpenaiChatStreamBody):
    """
    stream api for OpenAI ChatCompletion
    @param request: fastapi request
    @param body: request body
    @return: response
    """
    ret = chat_completion_stream(request, body)
    return ret
