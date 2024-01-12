from fastapi import APIRouter, Request

from openaoe.backend.model.dto.XunfeiDto import XunfeiSparkChatReqDto
from openaoe.backend.service.service_xunfei import spark_chat_svc

router = APIRouter()


@router.post("/v1/spark/chat", tags=["Spark"])
async def trans_general(request: Request, body: XunfeiSparkChatReqDto):
    ret = spark_chat_svc(request, body)
    return ret
