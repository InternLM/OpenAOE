from typing import Optional, List

from pydantic import BaseModel


class Header(BaseModel):
    app_id: Optional[str] = None
    uid: Optional[str] = None


class Chat(BaseModel):
    domain: str = "generalv2"
    temperature: Optional[float] = 0.5
    max_tokens: Optional[int] = 2048
    top_k: Optional[int] = 4
    chat_id: Optional[str]


class Parameter(BaseModel):
    chat: Chat


class Text(BaseModel):
    role: str
    content: str


class Message(BaseModel):
    text: List[Text]


class Payload(BaseModel):
    message: Message


class XunfeiSparkChatBody(BaseModel):
    """
    parameter follows: https://www.xfyun.cn/doc/spark/Web.html#_1-%E6%8E%A5%E5%8F%A3%E8%AF%B4%E6%98%8E
    """
    header: Optional[Header] = None
    parameter: Parameter
    payload: Payload
