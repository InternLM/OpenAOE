import logging


def log(name):
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    formatter = logging.Formatter(
        "%(levelname)s:     %(asctime)s - %(module)s-%(funcName)s-line:%(lineno)d - %(message)s"
    )
    ch = logging.StreamHandler()
    ch.setFormatter(formatter)
    logger.addHandler(ch)
    return logger


logger = log("util")
