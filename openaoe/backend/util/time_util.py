import re
import time
import pytz
from datetime import datetime, timedelta
from time import mktime
from wsgiref.handlers import format_date_time

from ..util.log import logger
from ..config.constant import DATE_PATTERN


def get_current_date() -> str:
    cur_time = datetime.now()
    date = format_date_time(mktime(cur_time.timetuple()))
    return date


def get_current_datetime() -> datetime:
    # 设置时区
    tz = pytz.timezone('Asia/Shanghai')
    # 获取当前时区的时间
    date = datetime.now(tz)
    return date


def get_human_friendly_date(date: datetime = None) -> str:
    if not date:
        date = get_current_datetime()
    return date.strftime(DATE_PATTERN)


def get_current_ts_ms() -> int:
    return int(round(time.time() * 1000))


def get_current_ts_s():
    return int(round(time.time()))


def parse_date(date: str, pattern: str):
    try:
        d = datetime.strptime(date, pattern)
        return d
    except ValueError as _:
        logger.error("invalid date: %s to format, pattern: %s", date, pattern)
        return None


def get_offset_date(offset_day: int, date: datetime=None) -> datetime:
    if not date:
        date = get_current_datetime()
    return date + timedelta(days=offset_day)


# 获取[start_date, end_date)之间的日期列表
def get_between_dates(start_date: datetime, end_date: datetime=None):
    if not end_date:
        end_date = get_current_datetime()

    if end_date <= start_date:
        return None

    ret = []
    while get_human_friendly_date(start_date) != get_human_friendly_date(end_date):
        ret.append(start_date)
        start_date = get_offset_date(1, start_date)
    return ret


def get_timestamp_after_openai_format_time(time_str):
    if not time_str:
        return None
    r = re.search("(\\d+)h(\\d+)m(\\d+)s", time_str)
    if r:
        hour = r.group(1)
        min = r.group(2)
        second = r.group(3)
        offset = 3600 * hour + 60 * min + second
        return get_current_ts_s() + offset
    return None


if __name__ == "__main__":
    now = get_current_datetime()
    time.sleep(5)
    print(get_between_dates(now))
