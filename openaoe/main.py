import argparse
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.responses import HTMLResponse

from openaoe.backend.api.route_claude import router as claude
from openaoe.backend.api.route_google import router as google
from openaoe.backend.api.route_internlm import router as internlm
from openaoe.backend.api.route_minimax import router as minimax
from openaoe.backend.api.route_openai import router as openai
from openaoe.backend.api.route_xunfei import router as xunfei
from openaoe.backend.config.biz_config import app_abs_path, img_out_path
from openaoe.backend.config.biz_config import load_config
from openaoe.backend.util.log import log
from openaoe.backend.util.str_util import safe_join

logger = log(__name__)

# define global variable
API_VER = 'v1'
base_dir = app_abs_path()
STATIC_RESOURCE_DIR = os.path.join(base_dir, "frontend/dist")
CSS_PATH_LIB = f"{STATIC_RESOURCE_DIR}/assets"
IMG_PATH_LIB = f"{STATIC_RESOURCE_DIR}/assets"
JS_PATH_LIB = f"{STATIC_RESOURCE_DIR}/js"
path = img_out_path()
OUT_IMG_PATH_LIB = f"{path}"

app = FastAPI()
app.mount("/static", StaticFiles(directory=STATIC_RESOURCE_DIR), name="static")


@app.get("/", response_class=HTMLResponse)
@app.get("/home", response_class=HTMLResponse)
async def server():
    return FileResponse(f"{STATIC_RESOURCE_DIR}/index.html")


@app.get("/assets/css/{path:path}")
async def build_resource(path: str):
    build_file = safe_join(CSS_PATH_LIB, path)
    return FileResponse(build_file)


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
    parser = argparse.ArgumentParser(description="Example app using a YAML config file.")
    parser.add_argument('-f', '--file', type=str, required=True, help='Path to the YAML config file.')

    config_path = parser.parse_args()

    logger.info(f"your config file is: {config_path.file}")
    load_config(config_path.file)

    os.system("gunicorn openaoe.main:app -w 3 -k uvicorn.workers.UvicornWorker --preload --bind 0.0.0.0:10099 -t 600")


if __name__ == "__main__":
    main()
