import re
import time
import pytz
from datetime import datetime, timedelta
from time import mktime
from wsgiref.handlers import format_date_time

from openaoe.backend.util.log import logger
from openaoe.backend.config.constant import DATE_PATTERN


def get_current_date() -> str:
    cur_time = datetime.now()
    date = format_date_time(mktime(cur_time.timetuple()))
    return date


def get_current_datetime() -> datetime:
    tz = pytz.timezone('Asia/Shanghai')
    date = datetime.now(tz)
    return date


def get_human_friendly_date(date: datetime = None) -> str:
    if not date:
        date = get_current_datetime()
    return date.strftime(DATE_PATTERN)


def get_current_ts_ms() -> int:
    return int(round(time.time() * 1000))


def get_current_ts_s() -> int:
    return int(round(time.time()))


def parse_date(date: str, pattern: str) -> [datetime, None]:
    try:
        d = datetime.strptime(date, pattern)
        return d
    except ValueError as _:
        logger.error("invalid date: %s to format, pattern: %s", date, pattern)
        return None


def get_offset_date(offset_day: int, date: datetime = None) -> datetime:
    if not date:
        date = get_current_datetime()
    return date + timedelta(days=offset_day)


def get_between_dates(start_date: datetime, end_date: datetime = None) -> [list, None]:
    """
    [start_date, end_date)
    :param start_date:
    :param end_date:
    :return:
    """
    if not end_date:
        end_date = get_current_datetime()

    if end_date <= start_date:
        return None

    ret = []
    while get_human_friendly_date(start_date) != get_human_friendly_date(end_date):
        ret.append(start_date)
        start_date = get_offset_date(1, start_date)
    return ret
