from fastapi import APIRouter, Request

from openaoe.backend.model.minimax import MinimaxChatCompletionBody
from openaoe.backend.service.service_minimax import chat_completion, minimax_chat_stream_svc

router = APIRouter()


@router.post("/v1/text/chat", tags=["MiniMax"])
async def minimax_chat(request: Request, body: MinimaxChatCompletionBody):
    """
    prompt 表示对话前提 \n
    []messages 表示历史对话记录，其中sender_type固定取值为USER/BOT
    """
    ret = chat_completion(request, body)
    return ret


@router.post("/v1/text/chat-stream", tags=["MiniMax"])
async def minimax_chat_stream(request: Request, req_dto: MinimaxChatCompletionBody):
    """
    prompt 表示对话前提\n
    []messages 表示历史对话记录，其中sender_type固定取值为USER/BOT
    """
    req_dto.stream = True
    ret = minimax_chat_stream_svc(request, req_dto)
    return ret
