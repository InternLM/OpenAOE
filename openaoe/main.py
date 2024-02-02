import os

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from starlette.responses import HTMLResponse

from openaoe.backend.api.route_claude import router as claude
from openaoe.backend.api.route_google import router as google
from openaoe.backend.api.route_internlm import router as internlm
from openaoe.backend.api.route_minimax import router as minimax
from openaoe.backend.api.route_openai import router as openai
from openaoe.backend.api.route_xunfei import router as xunfei
from openaoe.backend.config.biz_config import img_out_path, init_config
from openaoe.backend.util.log import log
from openaoe.backend.util.str_util import safe_join


logger = log(__name__)
# define global variable
API_VER = 'v1'
base_dir = os.path.dirname(os.path.abspath(__file__))
STATIC_RESOURCE_DIR = os.path.join(base_dir, "frontend", "dist")
ASSETS_RESOURCE_DIR = os.path.join(STATIC_RESOURCE_DIR, "assets")

path = img_out_path()

# init configuration content
BIZ_CONFIG = init_config()

app = FastAPI()


@app.get("/config/json")
async def get_config_json():
    return BIZ_CONFIG.json


@app.get("/", response_class=HTMLResponse)
@app.get("/home", response_class=HTMLResponse)
async def server():
    return FileResponse(f"{STATIC_RESOURCE_DIR}/index.html")


@app.get("/assets/{path:path}")
async def build_resource(path: str):
    print(ASSETS_RESOURCE_DIR, path)
    static_file = safe_join(ASSETS_RESOURCE_DIR, path)
    print(static_file)
    return FileResponse(static_file)


@app.get("/{path:path}")
async def build_resource(path: str):
    static_file = safe_join(STATIC_RESOURCE_DIR, path)
    return FileResponse(static_file)


# add middlewares here if you need
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# add api routers
app.include_router(minimax, prefix=f"/{API_VER}/minimax")
app.include_router(openai, prefix=f"/{API_VER}/openai")
app.include_router(google, prefix=f"/{API_VER}/google")
app.include_router(claude, prefix=f"/{API_VER}/claude")
app.include_router(xunfei, prefix=f"/{API_VER}/xunfei")
app.include_router(internlm, prefix=f"/{API_VER}/internlm")


def main():
    """
    main function
    start server use uvicorn, default workers: 3
    """
    uvicorn.run(
        "openaoe.main:app",
        host='0.0.0.0',
        port=10099,
        timeout_keep_alive=600,
        workers=3
    )


if __name__ == "__main__":
    main()
