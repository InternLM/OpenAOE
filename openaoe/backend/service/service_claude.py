import json
from typing import List

from anthropic import Anthropic, HUMAN_PROMPT, AI_PROMPT
from sse_starlette.sse import EventSourceResponse

from openaoe.backend.config.biz_config import get_api_key
from openaoe.backend.config.constant import TYPE_BOT, TYPE_USER, TYPE_SYSTEM
from openaoe.backend.config.constant import VENDOR_CLAUDE
from openaoe.backend.model.aoe_response import AOEResponse
from openaoe.backend.model.claude import ClaudeChatBody, ClaudeMessage


def claude_chat_stream_svc(request, body: ClaudeChatBody):
    """
    stream api logic for Claude model
    use anthropic SDK: https://github.com/anthropics/anthropic-sdk-python
    """
    api_key = get_api_key(VENDOR_CLAUDE)
    prompt = _gen_prompt(body.prompt, body.messages)
    if not prompt or len(prompt) == 0:
        return AOEResponse(
            msg="error",
            msgCode="-1",
            data="prompt or messages must be set"
        )

    anthropic = Anthropic(api_key=api_key)

    async def stream():
        try:
            conn = anthropic.completions.create(
                prompt=prompt,
                max_tokens_to_sample=body.max_tokens,
                model=body.model,
                stream=True,
            )
            stop_flag = False
            while True:
                if await request.is_disconnected():
                    break

                for msg in conn:
                    dict_item = {
                        "msg": "",
                        "success": "true"
                    }

                    if msg.stop_reason:
                        dict_item["stop_reason"] = msg.stop_reason
                        stop_flag = True

                    if msg.completion:
                        dict_item["success"] = "true"
                        dict_item["msg"] = msg.completion

                    if dict_item:
                        yield json.dumps(dict_item, ensure_ascii=False)
                if stop_flag:
                    break
            return

        except Exception as e:
            dict_item = {
                "success": "false",
                "msg": str(e)
            }
            yield json.dumps(dict_item)
            return

    return EventSourceResponse(stream())


def _gen_prompt(prompt: str, messages: List[ClaudeMessage]):
    if not messages:
        if not prompt:
            return ""
        return f"{HUMAN_PROMPT} {prompt}{AI_PROMPT}"

    ret = ""
    for item in messages:
        if item.role == TYPE_BOT:
            ret += f"{AI_PROMPT} {item.content} "
        elif item.role == TYPE_USER:
            ret += f"{HUMAN_PROMPT} {item.content} "
        elif item.role == TYPE_SYSTEM:
            ret = item.content + ret
    ret += f"{AI_PROMPT}"
    return ret
