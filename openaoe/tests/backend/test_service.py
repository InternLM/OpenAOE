import datetime
import unittest
from time import mktime
from wsgiref.handlers import format_date_time

from openaoe.backend.model.claude import ClaudeMessage
from openaoe.backend.service.service_claude import _gen_prompt
from openaoe.backend.service.service_xunfei import _calc_authorization


class TestService(unittest.TestCase):

    def test_claude_gen_prompt(self):
        system_content = "Act as a python coder, when user ask something, answer with code"
        msgs = [ClaudeMessage(role="system", content=system_content)]
        prompt_str = _gen_prompt(msgs)
        self.assertTrue(prompt_str, f"{system_content}\n\nAssistant:")

    def test_spark_calc_authorization(self):
        t = datetime.datetime(year=2024, month=1, day=17, hour=11, minute=11, second=11)
        date = format_date_time(mktime(t.timetuple()))
        ak = "ak"
        sk = "sk"
        host = "host"
        sign = _calc_authorization(ak, sk, date, host)
        self.assertTrue(sign, "YXBpX2tleT0iYWsiLCBhbGdvcml0aG09ImhtYWMtc2hhMjU2IiwgaGVhZGVycz0iaG9zdCBkYXRlIHJl"
                              "cXVlc3QtbGluZSIsIHNpZ25hdHVyZT0iS2ZMdHdFMk9sWFhDRTdCejJtTjZuRFhkTS8xVnRid24weTIvcTA3V2FLQT0i")
