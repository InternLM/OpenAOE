from fastapi import APIRouter, Request

from openaoe.backend.model.minimax import MinimaxChatCompletionBody
from openaoe.backend.service.service_minimax import minimax_chat_stream_svc


router = APIRouter()


@router.post("/v1/text/chat-stream", tags=["MiniMax"])
async def minimax_chat_stream(request: Request, req_dto: MinimaxChatCompletionBody):
    req_dto.stream = True
    ret = minimax_chat_stream_svc(request, req_dto)
    return ret
