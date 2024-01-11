import json
import time
from typing import List

from anthropic import Anthropic, HUMAN_PROMPT, AI_PROMPT
from fastapi import Request
from slack_sdk.errors import SlackApiError
from sse_starlette.sse import EventSourceResponse

from ..config.biz_config import get_api_key
from ..config.constant import TYPE_BOT, TYPE_USER, TYPE_SYSTEM
from ..config.constant import VENDOR_CLAUDE
from ..model.dto.ClaudeDto import ClaudeChatReqDto, ClaudeMessage
from ..model.dto.ReturnBase import ReturnBase


def send_message(client, channel, text):
    try:
        return client.chat_postMessage(channel=channel, text=text)
    except SlackApiError as e:
        print(f"Error sending message: {e}")


def fetch_messages(client, channel, last_message_timestamp, bot_user_id):
    response = client.conversations_history(channel=channel, oldest=last_message_timestamp)
    return [msg['text'] for msg in response['messages'] if msg['user'] == bot_user_id]


def get_new_messages(client, channel, last_message_timestamp, bot_user_id):
    time.sleep(1)
    result_index = 0
    while True:
        messages = fetch_messages(client, channel, last_message_timestamp, bot_user_id)
        if messages and "*Please note:*" in messages[0]:
            result_index = 1

        if messages and len(messages) > result_index and not messages[result_index].endswith('Typing…_'):
            return messages[result_index]
        time.sleep(1)


def find_direct_message_channel(client, user_id):
    try:
        response = client.conversations_open(users=user_id)
        return response['channel']['id']
    except SlackApiError as e:
        print(f"Error opening DM channel: {e}")


def claude_chat_anthropic(request: Request, req_dto: ClaudeChatReqDto):
    api_key = get_api_key(VENDOR_CLAUDE)
    prompt = gen_prompt(req_dto.prompt, req_dto.messages)
    if not prompt or len(prompt) == 0:
        return ReturnBase(
            msg="error",
            msgCode="-1",
            data="prompt or messages must be set"
        )

    try:
        anthropic = Anthropic(api_key=api_key)
        completion = anthropic.completions.create(
            model=req_dto.model,
            max_tokens_to_sample=req_dto.max_tokens,
            prompt=f"{HUMAN_PROMPT} {prompt}{AI_PROMPT}",
            temperature=req_dto.temperature
        )
        return ReturnBase(data=completion)
    except Exception as e:
        print(f"claude-chat failed: {e}")
        return ReturnBase(
            msg="error",
            msgCode="-1",
            data=str(e)
        )


def claude_chat_stream_svc(request, req_dto: ClaudeChatReqDto):
    api_key = get_api_key(VENDOR_CLAUDE)
    prompt = gen_prompt(req_dto.prompt, req_dto.messages)
    if not prompt or len(prompt) == 0:
        return ReturnBase(
            msg="error",
            msgCode="-1",
            data="prompt or messages must be set"
        )

    anthropic = Anthropic(api_key=api_key)

    async def stream():
        try:
            conn = anthropic.completions.create(
                prompt=prompt,
                max_tokens_to_sample=req_dto.max_tokens,
                model=req_dto.model,
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


def is_valid_model(model: str):
    valid_models = ["claude-1", "claude-1-100k", "claude-instant-1", "claude-instant-1-100k", "claude-1.3",
                    "claude-1.3-100k", "claude-1.0", "claude-instant-1.1-100k", "claude-instant-1.0"]
    return model in valid_models


def gen_prompt(prompt: str, messages: List[ClaudeMessage]):
    if not messages or len(messages) == 0:
        if not prompt or len(prompt) == 0:
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


if __name__ == "__main__":
    # main()
    pass
