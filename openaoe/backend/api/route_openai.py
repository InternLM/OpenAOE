from fastapi import APIRouter, Request

from openaoe.backend.model.openai import OpenaiChatStreamBody
from openaoe.backend.service.service_openai import chat_completion_stream

router = APIRouter()


@router.post("/v1/text/chat-stream", tags=["OpenAI"])
async def openai_chat_stream(request: Request, req_dto: OpenaiChatStreamBody):
    """
    OpenAI ChatCompletion with Stream
    """
    ret = chat_completion_stream(request, req_dto)
    return ret


