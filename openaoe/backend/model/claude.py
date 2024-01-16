from pydantic import BaseModel
from typing import Optional, List


class ClaudeMessage(BaseModel):
    role: str
    content: str


class ClaudeChatBody(BaseModel):
    """
    parameter follows: https://github.com/anthropics/anthropic-sdk-python
    model choose: https://docs.anthropic.com/claude/reference/selecting-a-model
    """
    prompt: Optional[str] = None
    model: Optional[str] = "claude-instant-1"
    max_tokens: Optional[int] = 300
    temperature: Optional[float] = 1.0
    messages: Optional[List[ClaudeMessage]] = None
