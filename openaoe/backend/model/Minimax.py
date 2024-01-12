from pydantic import BaseModel
from typing import Optional, List, Union


class RoleMeta(BaseModel):
    user_name: str
    bot_name: str


class Messages(BaseModel):
    sender_type: str
    text: str


class MinimaxChatCompletionBody(BaseModel):
    model: Optional[str] = 'abab5-chat'
    prompt: str
    role_meta: Optional[Union[RoleMeta, None]] = None
    messages: Optional[List[Messages]] = None
    stream: Optional[bool] = False
    type: Optional[str] = "text"

