from fastapi import APIRouter, Request, Response

from openaoe.backend.model.google import GooglePalmChatBody
from openaoe.backend.service.service_google import palm_chat_svc, Gemma
from openaoe.backend.model.openaoe import AoeChatBody

router = APIRouter()


@router.post("/v1/palm/chat", tags=["PaLM"])
async def palm_chat(body: GooglePalmChatBody):
    """
    chat api for google PaLM model
    @param body: request body
    @return: response
    """
    ret = await palm_chat_svc(body)
    return ret


@router.post("/v1/gemma/chat", tags=["Gemma"])
async def gemma_chat(body: AoeChatBody, request: Request, response: Response):
    return await Gemma(request, response).chat(body)
