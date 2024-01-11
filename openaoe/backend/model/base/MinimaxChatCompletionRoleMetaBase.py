from pydantic import BaseModel


class MinimaxChatCompletionRoleMetaBase(BaseModel):
    user_name: str
    bot_name: str
