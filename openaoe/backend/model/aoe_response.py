from pydantic import BaseModel
from typing import Optional


class AOEResponse(BaseModel):
    """
    Standard OpenAOE response
    """
    msg: Optional[str] = "ok"
    msgCode: Optional[str] = "10000"
    data: Optional[object] = None


