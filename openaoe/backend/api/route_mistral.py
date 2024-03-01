from fastapi import APIRouter, Request, Response

from openaoe.backend.service.mistral import Mistral
from openaoe.backend.model.openaoe import AoeChatBody

router = APIRouter()


@router.post("/v1/mistral/chat", tags=["Mistral"])
async def mistral_chat(body: AoeChatBody, request: Request, response: Response):
    """
    chat api for Mistral 7b model
    :param body: request body
    :param request: request
    :param response: response
    :return
    """
    return await Mistral(request, response).chat(body)
