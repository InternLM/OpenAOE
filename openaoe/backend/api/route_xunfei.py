from fastapi import APIRouter

from openaoe.backend.model.xunfei import XunfeiSparkChatBody
from openaoe.backend.service.service_xunfei import spark_chat_svc

router = APIRouter()


@router.post("/v1/spark/chat", tags=["Spark"])
async def spark_chat(body: XunfeiSparkChatBody):
    """
    chat api for Xunfei Spark model
    @param body: request body
    @return: response
    """
    ret = spark_chat_svc(body)
    return ret
