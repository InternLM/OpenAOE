from typing import Optional, List, Union

from pydantic import BaseModel


class RoleMeta(BaseModel):
    user_name: str
    bot_name: str


class Messages(BaseModel):
    sender_type: str
    text: str


class MinimaxChatCompletionBody(BaseModel):
    """
    parameter follows: https://api.minimax.chat/document/guides/chat-model/chat/api?id=6569c88e48bc7b684b3037a9#3.1%20%E8%AF%B7%E6%B1%82%E4%BD%93(request)%E5%8F%82%E6%95%B0
    """
    model: Optional[str] = 'abab5-chat'
    prompt: str
    role_meta: Optional[Union[RoleMeta, None]] = None
    messages: Optional[List[Messages]] = None
    stream: Optional[bool] = False
    type: Optional[str] = "text"
