from pydantic import BaseModel
from typing import Optional, List


class Message(BaseModel):
    content: str
    author: Optional[str] = 0


class Prompt(BaseModel):
    messages: List[Message]


class GooglePalmChatReqDto(BaseModel):
    model: Optional[str] = "chat-bison-001"
    prompt: Prompt
    temperature: Optional[float] = 0.1
    candidate_count: Optional[int] = 1


class TextPrompt(BaseModel):
    text: str


class GoogleSafetySetting(BaseModel):
    category: Optional[str] = "HARM_CATEGORY_UNSPECIFIED"
    threshold: Optional[str] = "BLOCK_NONE"


class GooglePalmTextReqDto(BaseModel):
    model: Optional[str] = "text-bison-001"
    prompt: TextPrompt
    temperature: Optional[float] = 0.1
    candidate_count: Optional[int] = 1
    max_output_tokens: Optional[int] = 1024
    safety_settings: Optional[List[GoogleSafetySetting]] = []


class GoogleBardAskImgReqDto(BaseModel):
    img_url: str
    prompt: str
    bard_token: str

