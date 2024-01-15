from pydantic import BaseModel
from typing import Optional, List, Union, Dict
from openai._types import NOT_GIVEN


class Context(BaseModel):
    sender_type: str = "assistant"
    text: str = ''


class RoleMeta(BaseModel):
    user_name: Optional[str] = 'user'
    bot_name: Optional[str] = 'assistant'


class TextMsg(BaseModel):
    type: str = 'text'
    text: str


class ImgURL(BaseModel):
    url: str
    detail: Optional[str] = 'low'


class ImgMsg(BaseModel):
    type: str = 'image_url'
    image_url: ImgURL


class Message(BaseModel):
    role: str
    content: Optional[Union[str, List[Union[TextMsg, ImgMsg]]]] = ''


class InternlmChatCompletionBody(BaseModel):
    """
        see https://platform.openai.com/docs/api-reference/chat/create
    """
    model: Optional[str] = 'internlm-chat-7b'
    role_meta: Optional[RoleMeta]
    prompt: Optional[str]
    messages: List[Context]
    temperature: Optional[float] = 0.7
    top_p: Optional[float] = 1
    n: Optional[int] = 1
    stop: Optional[Union[str, List]] = "false"
    presence_penalty: Optional[float] = 0
    frequency_penalty: Optional[float] = 0
    user: Optional[str] = NOT_GIVEN
    stream: Optional[bool] = False
    timeout: Optional[int] = 600
    session_id: Optional[int] = -1
    ignore_eos: Optional[bool] = False
    max_tokens: Optional[int] = 1024


class OpenaiChatCompletionV2Body(BaseModel):
    model: Optional[str] = 'gpt-3.5-turbo'
    messages: Union[str, List[Message]]
    temperature: Optional[float] = 1
    top_p: Optional[float] = 1
    n: Optional[int] = 1
    stream: Optional[bool] = False
    stop: Optional[Union[str, List]] = NOT_GIVEN
    max_tokens: Optional[int] = NOT_GIVEN
    presence_penalty: Optional[float] = NOT_GIVEN
    frequency_penalty: Optional[float] = NOT_GIVEN
    timeout: Optional[int] = 600


class OpenaiCompletionBody(BaseModel):
    """
        see https://platform.openai.com/docs/api-reference/completions/create
    """
    model: Optional[str] = 'text-davinci-003'
    prompt: Union[str, List]
    max_tokens: Optional[int] = 1024
    temperature: Optional[float] = 1
    top_p: Optional[float] = 1
    n: Optional[int] = 1
    echo: Optional[bool] = False
    stop: Optional[Union[str, List]] = NOT_GIVEN
    presence_penalty: Optional[float] = 0
    frequency_penalty: Optional[float] = 0
    best_of: Optional[int] = 1
    logit_bias: Optional[Dict] = NOT_GIVEN
    user: Optional[str] = NOT_GIVEN
    timeout: Optional[int] = 600


class OpenaiChatStreamBody(BaseModel):
    model: Optional[str] = 'gpt-3.5-turbo'
    prompt: str
    temperature: Optional[float] = 1
    messages: Optional[List[Context]] = None
    role_meta: Optional[RoleMeta] = None
    # return type: text or json
    type: Optional[str] = 'text'
    timeout: Optional[int] = 600
    # functions: Optional[List[Function]] = None
    # function_call: Optional[object] = 'auto'


class OpenaiCheckBody(BaseModel):
    model: Optional[str] = 'gpt-3.5-turbo'
    prompt: str
    api_key: str
