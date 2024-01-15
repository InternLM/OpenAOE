from fastapi import APIRouter, Request

from openaoe.backend.model.claude import ClaudeChatBody
from openaoe.backend.service.service_claude import claude_chat_stream_svc


router = APIRouter()


@router.post("/v1/text/chat-stream", tags=["claude"])
async def claude_chat_stream(request: Request, body: ClaudeChatBody):
    ret = claude_chat_stream_svc(request, body)
    return ret
