from typing import Optional, List, Literal, Dict
from pydantic import BaseModel, Field


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


"""
ref. to https://github.com/ollama/ollama/blob/main/docs/api.md
Parameters
model: (required) the model name
messages: the messages of the chat, this can be used to keep a chat memory
The message object has the following fields:

role: the role of the message, either system, user or assistant
content: the content of the message
images (optional): a list of images to include in the message (for multimodal models such as llava)
Advanced parameters (optional):

format: the format to return a response in. Currently the only accepted value is json
options: additional model parameters listed in the documentation for the Modelfile such as temperature
template: the prompt template to use (overrides what is defined in the Modelfile)
stream: if false the response will be returned as a single response object, rather than a stream of objects
keep_alive: controls how long the model will stay loaded into memory following the request (default: 5m)
"""


class OllamaMessage(BaseModel):
    role: Literal["user", "system", "assistant"] = "user"
    content: str
    images: Optional[List[str]] = None  # img in base64


class OllamaChatBody(BaseModel):
    model: str
    messages: List[OllamaMessage] = Field(default_factory=List)
    options: Optional[Dict] = Field(default_factory=dict)
    template: Optional[str] = None
    stream: Optional[bool] = True
    keep_alive: Optional[str] = '5m'

