from fastapi import APIRouter, Request

from openaoe.backend.model.xunfei import XunfeiSparkChatBody
from openaoe.backend.service.service_xunfei import spark_chat_svc

router = APIRouter()


@router.post("/v1/spark/chat", tags=["Spark"])
async def spark_chat(request: Request, body: XunfeiSparkChatBody):
    ret = spark_chat_svc(request, body)
    return ret
