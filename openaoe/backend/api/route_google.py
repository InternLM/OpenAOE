from fastapi import APIRouter

from openaoe.backend.model.google import GooglePalmChatBody
from openaoe.backend.service.service_google import palm_chat_svc

router = APIRouter()


@router.post("/v1/palm/chat", tags=["PaLM"])
async def palm_chat(body: GooglePalmChatBody):
    """
    chat api for google PaLM model
    @param body: request body
    @return: response
    """
    ret = palm_chat_svc(body)
    return ret
