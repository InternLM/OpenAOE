import hashlib
import hmac
import json
from urllib.parse import urlencode

from fastapi import Request
from websocket import create_connection

from openaoe.backend.config.biz_config import get_model_configuration, get_base_url
from openaoe.backend.config.constant import VENDOR_XUNFEI
from openaoe.backend.model.aoe_response import AOEResponse
from openaoe.backend.model.xunfei import XunfeiSparkChatBody
from openaoe.backend.util.log import log
from openaoe.backend.util.time_util import get_current_date

logger = log(__name__)


def calc_authorization(ak: str, sk: str, date: str, host: str) -> str:
    tmp = "host: " + host + "\n"
    tmp += "date: " + date + "\n"
    tmp += "GET " + "/v2.1/chat" + " HTTP/1.1"
    tmp_sha = hmac.new(sk.encode('utf-8'), tmp.encode('utf-8'), digestmod=hashlib.sha256).digest()
    import base64
    signature = base64.b64encode(tmp_sha).decode(encoding='utf-8')
    authorization_origin = f'api_key="{ak}", algorithm="hmac-sha256", headers="host date request-line", signature="{signature}"'
    authorization = base64.b64encode(authorization_origin.encode('utf-8')).decode(encoding='utf-8')
    return authorization


def websocket_process(url: str, body: dict):
    ws = create_connection(url)
    try:
        ws.send(json.dumps(body))
    except Exception as e:
        logger.error(e)

    res = ""
    while True:
        rcv_text = ws.recv()
        content = json.loads(rcv_text)
        header = content.get("header")
        if header.get("code") != 0:
            res = "error"

            # spark failed
            logger.error(f"spark failed: {content}")

            break

        payload = content.get("payload")
        text = payload.get("choices").get("text")
        for item in text:
            res += item.get("content")
        if header.get("status") == 2:
            break

    ws.close()
    return res


def spark_chat_svc(request: Request, req_dto: XunfeiSparkChatBody):
    url = get_base_url(VENDOR_XUNFEI)
    app_id = get_model_configuration(VENDOR_XUNFEI, "app_id")
    ak = get_model_configuration(VENDOR_XUNFEI, "ak")
    sk = get_model_configuration(VENDOR_XUNFEI, "sk")
    date = get_current_date()
    host = "spark-api.xf-yun.com"
    authorization = calc_authorization(ak=ak, sk=sk, date=date, host=host)
    v = {
        "authorization": authorization,
        "date": date,
        "host": host
    }
    v_urlencode = urlencode(v)
    url = f"{url}?{v_urlencode}"
    texts = [ 
        { "role": item.role, "content": item.content } 
        for item in req_dto.payload.message.text or []
    ]
    uid = None
    if req_dto.header is not None:
        uid = None if req_dto.header.uid is None else req_dto.header.uid
    body = {
        "header": {
            "app_id": app_id,
            "uid": uid
        },
        "parameter": {
            "chat": {
                "domain": req_dto.parameter.chat.domain,
                "temperature": req_dto.parameter.chat.temperature,
                "max_tokens": req_dto.parameter.chat.max_tokens
            }
        },
        "payload": {
            "message": {
                "text": texts
            }
        }
    }
    try:
        r = websocket_process(url, body)
        return AOEResponse(data=r)
    except Exception as e:
        logger.error(e)
        return AOEResponse(
            msg="error",
            msgCode="-1",
            data=str(e)
        )


if __name__ == "__main__":
    pass
