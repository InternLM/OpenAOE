from pydantic import BaseModel
from typing import Optional, List


class BaiduTransGeneralReqDto(BaseModel):
    q: str
    frm: Optional[str] = "auto"
    to: Optional[str] = "en"


class Message(BaseModel):
    role: str
    content: str


class BaiduWenxinWorkshopReqDto(BaseModel):
    messages: List[Message]
    stream: Optional[bool] = False
