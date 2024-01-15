from fastapi import APIRouter, Request

from openaoe.backend.model.google import GooglePalmChatBody, GooglePalmTextBody, GoogleBardAskImgBody
from openaoe.backend.service.service_google import palm_chat_svc, palm_text_svc, bard_ask_img_svc

router = APIRouter()


@router.post("/v1/palm/chat", tags=["PaLM"])
async def palm_chat(request: Request, body: GooglePalmChatBody):
    ret = palm_chat_svc(request, body)
    return ret


@router.post("/v1/palm/text", tags=["PaLM"])
async def palm_chat(request: Request, body: GooglePalmTextBody):
    ret = palm_text_svc(request, body)
    return ret


@router.post("/v1/bard/ask_about_image", tags=["PaLM"], include_in_schema=False)
async def palm_chat(body: GoogleBardAskImgBody):
    ret = bard_ask_img_svc(body)
    return ret
