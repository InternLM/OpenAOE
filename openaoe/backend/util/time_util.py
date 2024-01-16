from datetime import datetime
from time import mktime
from wsgiref.handlers import format_date_time


def get_current_date() -> str:
    cur_time = datetime.now()
    date = format_date_time(mktime(cur_time.timetuple()))
    return date
