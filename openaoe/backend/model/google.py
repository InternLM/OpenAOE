from pydantic import BaseModel
from typing import Optional, List


class Message(BaseModel):
    content: str
    author: Optional[str] = 0


class Prompt(BaseModel):
    messages: List[Message]


class GooglePalmChatBody(BaseModel):
    model: Optional[str] = "chat-bison-001"
    prompt: Prompt
    temperature: Optional[float] = 0.1
    candidate_count: Optional[int] = 1



