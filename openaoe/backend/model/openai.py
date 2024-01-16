from pydantic import BaseModel
from typing import Optional, List


class Context(BaseModel):
    send_type: str = 'assistant'
    sender_type: str = "assistant"
    text: str = ''


class RoleMeta(BaseModel):
    user_name: Optional[str] = 'user'
    bot_name: Optional[str] = 'assistant'


class OpenaiChatStreamBody(BaseModel):
    model: Optional[str] = 'gpt-3.5-turbo'
    prompt: str
    temperature: Optional[float] = 1
    messages: Optional[List[Context]] = None
    role_meta: Optional[RoleMeta] = None
    # return type: text or json
    type: Optional[str] = 'text'
    timeout: Optional[int] = 600
