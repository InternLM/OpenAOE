from typing import Optional, List, Literal
from pydantic import BaseModel


class Context(BaseModel):
    send_type: str = 'assistant'
    sender_type: str = "assistant"
    text: str = ''


class RoleMeta(BaseModel):
    user_name: Optional[str] = 'user'
    bot_name: Optional[str] = 'assistant'


class AoeChatBody(BaseModel):
    """
    OpenAOE general request body
    """
    model: str
    prompt: str
    messages: Optional[List[Context]] = []
    role_meta: Optional[RoleMeta] = None
    type: Optional[Literal['text', 'json']] = 'json'
    stream: Optional[bool] = True
