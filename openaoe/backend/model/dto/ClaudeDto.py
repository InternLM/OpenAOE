from pydantic import BaseModel
from typing import Optional, List


class ClaudeMessage(BaseModel):
    role: str
    content: str


class ClaudeChatReqDto(BaseModel):
    """
        see
        - https://github.com/anthropics/anthropic-sdk-python
        model see
        - https://docs.anthropic.com/claude/reference/complete_post
    """
    prompt: Optional[str] = None
    model: Optional[str] = "claude-instant-1"
    max_tokens: Optional[int] = 300
    temperature: Optional[float] = 1.0
    messages: Optional[List[ClaudeMessage]] = None
