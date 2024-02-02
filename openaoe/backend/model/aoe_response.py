from typing import Optional

from pydantic import BaseModel


class AOEResponse(BaseModel):
    """
    Standard OpenAOE response
    """
    msg: Optional[str] = "ok"
    msgCode: Optional[str] = "10000"
    data: Optional[object] = None


class StreamResponse(BaseModel):
    """
    Standard OpenAOE stream response
    """
    success: Optional[bool] = True
    msg: Optional[str] = ""
