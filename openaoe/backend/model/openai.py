from typing import Optional, List

from pydantic import BaseModel


class Context(BaseModel):
    send_type: str = 'assistant'
    sender_type: str = "assistant"
    text: str = ''


class RoleMeta(BaseModel):
    user_name: Optional[str] = 'user'
    bot_name: Optional[str] = 'assistant'


class OpenaiChatStreamBody(BaseModel):
    """
    parameter follows: https://platform.openai.com/docs/api-reference/chat/create
    """
    model: Optional[str] = 'gpt-3.5-turbo'
    prompt: str
    temperature: Optional[float] = 1
    messages: Optional[List[Context]] = None
    role_meta: Optional[RoleMeta] = None
    type: Optional[str] = 'text'
    timeout: Optional[int] = 600
