from typing import Optional, List, Union

from openai._types import NOT_GIVEN
from pydantic import BaseModel


class Context(BaseModel):
    sender_type: str = "assistant"
    text: str = ''


class RoleMeta(BaseModel):
    user_name: Optional[str] = 'user'
    bot_name: Optional[str] = 'assistant'


class InternlmChatCompletionBody(BaseModel):
    model: Optional[str] = 'internlm-chat-7b'
    role_meta: Optional[RoleMeta]
    prompt: Optional[str]
    messages: List[Context]
    temperature: Optional[float] = 0.7
    top_p: Optional[float] = 0.8
    n: Optional[int] = 1
    stop: Optional[Union[str, List]] = "false"
    presence_penalty: Optional[float] = 0
    frequency_penalty: Optional[float] = 0.5
    user: Optional[str] = NOT_GIVEN
    stream: Optional[bool] = False
    timeout: Optional[int] = 600
    session_id: Optional[int] = -1
    ignore_eos: Optional[bool] = False
    max_tokens: Optional[int] = 1024
