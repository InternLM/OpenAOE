from pydantic import BaseModel
from typing import Optional


class AOEResponse(BaseModel):
    msg: Optional[str] = "ok"
    msgCode: Optional[str] = "10000"
    data: Optional[object] = None


class AOEProxyResponse(BaseModel):
    statusCode: Optional[int] = 200
    headers: Optional[dict] = {}
    body: Optional[object] = None
    msg: Optional[str] = 'ok'
    data: Optional[dict] = {}

