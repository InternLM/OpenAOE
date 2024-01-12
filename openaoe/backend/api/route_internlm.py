from fastapi import APIRouter, Request

from openaoe.backend.model.dto.InternlmDto import InternlmChatCompletionReqDto
from openaoe.backend.service.service_internlm import chat_completion_v1, chat_completion_stream_v1

router = APIRouter()


@router.post("/v1/chat/completions", tags=["Internlm"])
async def internlm_chat_completions_v1(request: Request, body: InternlmChatCompletionReqDto):
    """
    Internlm ChatCompletion
    """
    ret = chat_completion_v1(request, body)
    return ret


@router.post("/v1/chat/completions-stream", tags=["Internlm"])
async def internlm_chat_completions_v1(request: Request, body: InternlmChatCompletionReqDto):
    """
    Internlm ChatCompletion
    """
    ret = chat_completion_stream_v1(request, body)
    return ret
