from pydantic import BaseModel
from typing import Optional, List, Union, Dict
from openai._types import NOT_GIVEN


class Context(BaseModel):
    send_type: str = 'assistant'
    sender_type: str = "assistant"
    text: str = ''


class RoleMeta(BaseModel):
    user_name: Optional[str] = 'user'
    bot_name: Optional[str] = 'assistant'


class FunctionProperty(BaseModel):
    type: str
    description: Optional[str] = ''
    enum: Optional[List[object]] = []


class FunctionParameter(BaseModel):
    type: str
    required: Optional[List[str]]
    properties: Optional[Dict[str, FunctionProperty]]


class Function(BaseModel):
    name: str
    description: Optional[str] = ''
    parameters: Optional[FunctionParameter]


class FunctionCall(BaseModel):
    name: str
    arguments: str


class OpenaiChatCompletionReqDto(BaseModel):
    """
        see https://platform.openai.com/docs/api-reference/chat/create
    """
    model: Optional[str] = 'gpt-3.5-turbo'
    role_meta: Optional[RoleMeta]
    prompt: Optional[str]
    messages: Optional[List[Context]]
    temperature: Optional[float] = 1
    top_p: Optional[float] = 1
    n: Optional[int] = 1
    stop: Optional[Union[str, List]] = None
    presence_penalty: Optional[float] = 0
    frequency_penalty: Optional[float] = 0
    user: Optional[str] = None
    stream: Optional[bool] = False
    timeout: Optional[int] = 600
    functions: Optional[List[Function]] = NOT_GIVEN
    function_call: Optional[object] = NOT_GIVEN


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
    function_call: Optional[FunctionCall] = None
    name: Optional[str] = None


class OpenaiChatCompletionV2ReqDto(BaseModel):
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
    functions: Optional[List[Function]] = NOT_GIVEN
    function_call: Optional[object] = NOT_GIVEN


class OpenaiCompletionReqDto(BaseModel):
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


class OpenaiChatStreamReqDto(BaseModel):
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


class OpenaiCheckReqDto(BaseModel):
    model: Optional[str] = 'gpt-3.5-turbo'
    prompt: str
    api_key: str
