from fastapi import APIRouter, Request

from openaoe.backend.model.openai import OpenaiCompletionBody, OpenaiChatStreamBody, \
    OpenaiChatCompletionV2Body
from openaoe.backend.service.service_openai import completions, chat_completion_stream, chat_completion_svc, \
    proxy_files, proxy_assistants, proxy_threads, proxy_messages, proxy_runs

router = APIRouter()


@router.post("/v1/text/chat", tags=["OpenAI"])
async def openai_chat(request: Request, body: OpenaiChatCompletionV2Body):
    """
    OpenAI ChatCompletion
    """
    ret = chat_completion_svc(request, body)
    return ret


@router.post("/v1/completions", include_in_schema=False, tags=["OpenAI"])
async def openai_completions(request: Request, body: OpenaiCompletionBody):
    """
    OpenAI completion
    """
    ret = completions(request, body)
    return ret


@router.post("/v1/text/chat-stream", tags=["OpenAI"])
async def openai_chat_stream(request: Request, req_dto: OpenaiChatStreamBody):
    """
    OpenAI ChatCompletion with Stream
    """
    ret = chat_completion_stream(request, req_dto)
    return ret


@router.get("/v1/files", include_in_schema=False)
@router.post("/v1/files", include_in_schema=False)
@router.get("/v1/files/{id}", include_in_schema=False)
@router.get("/v1/files/{id}/content", include_in_schema=False)
@router.delete("/v1/files/{id}", include_in_schema=False)
async def proxy_for_files(request: Request):
    ret = await proxy_files(request)
    return ret


@router.get("/v1/assistants", include_in_schema=False)
@router.post("/v1/assistants", include_in_schema=False)
@router.get("/v1/assistants/{id}", include_in_schema=False)
@router.post("/v1/assistants/{id}", include_in_schema=False)
@router.delete("/v1/assistants/{id}", include_in_schema=False)
async def proxy_for_assistants(request: Request):
    ret = await proxy_assistants(request)
    return ret


@router.post("/v1/threads", include_in_schema=False)
@router.get("/v1/threads/{id}", include_in_schema=False)
@router.post("/v1/threads/{id}", include_in_schema=False)
@router.delete("/v1/threads/{id}", include_in_schema=False)
async def proxy_for_threads(request: Request):
    ret = await proxy_threads(request)
    return ret


@router.get("/v1/threads/{id}/messages", include_in_schema=False)
@router.post("/v1/threads/{id}/messages", include_in_schema=False)
@router.get("/v1/threads/{id}/messages/{message_id}", include_in_schema=False)
@router.post("/v1/threads/{id}/messages/{message_id}", include_in_schema=False)
async def proxy_for_messages(request: Request):
    ret = await proxy_messages(request)
    return ret


@router.get("/v1/threads/{id}/runs", include_in_schema=False)
@router.post("/v1/threads/{id}/runs", include_in_schema=False)
@router.get("/v1/threads/{id}/runs/{run_id}", include_in_schema=False)
@router.post("/v1/threads/{id}/runs/{run_id}", include_in_schema=False)
@router.post("/v1/threads/{id}/runs/{run_id}/submit_tool_outputs", include_in_schema=False)
@router.post("/v1/threads/{id}/runs/{run_id}/cancel", include_in_schema=False)
@router.get("/v1/threads/{id}/runs/{run_id}/steps/{step_id}", include_in_schema=False)
@router.get("/v1/threads/{id}/runs/{run_id}/steps", include_in_schema=False)
async def proxy_for_runs(request: Request):
    ret = await proxy_runs(request)
    return ret
