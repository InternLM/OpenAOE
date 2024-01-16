from fastapi import APIRouter, Request

from openaoe.backend.model.internlm import InternlmChatCompletionBody
from openaoe.backend.service.service_internlm import chat_completion_v1

router = APIRouter()


@router.post("/v1/chat/completions", tags=["Internlm"])
async def internlm_chat_completions_v1(request: Request, body: InternlmChatCompletionBody):
    """
    Internlm ChatCompletion
    """
    ret = chat_completion_v1(request, body)
    return ret
