import argparse
import os
import sys

import yaml

from openaoe.backend.util.log import log

logger = log(__name__)
biz_config = None


class BizConfig:
    def __init__(self, **args):
        self.__dict__.update(args)

    def get(self, field):
        if field in self.__dict__:
            return self.__dict__[field]
        return None


def init_config():
    parser = argparse.ArgumentParser(description="Example app using a YAML config file.")
    parser.add_argument('-f', '--file', type=str, required=True, help='Path to the YAML config file.')

    config_path = parser.parse_args()

    logger.info(f"your config file is: {config_path.file}")
    load_config(config_path.file)


def load_config(config_path):
    logger.info(f"start to init configuration from {config_path}.")
    with open(config_path) as fin:
        m = yaml.safe_load(fin)
        if not m or len(m) == 0:
            logger.error("init configuration failed. Exit")
            sys.exit(-1)

        global biz_config
        biz_config = BizConfig(**m)
    logger.info("init configuration successfully.")


def get_configuration(field):
    if biz_config.get(field):
        return biz_config.get(field)
    return None


def get_model_configuration(vendor: str, field):
    models = get_configuration("models")
    if not models:
        logger.error(f"invalid configuration file")
        sys.exit(-1)

    if models.get(vendor) and models.get(vendor).get(field):
        conf = models.get(vendor).get(field)
        logger.info(f"biz_config={conf}")
        return conf

    logger.error(f"vendor: {vendor} has no field: {field} configuration")
    return ""


def get_base_url(vendor: str) -> str:
    return get_model_configuration(vendor, "api_base")


def get_api_key(vendor: str) -> str:
    return get_model_configuration(vendor, "api_key")


def app_abs_path():
    return os.path.dirname(os.path.abspath(__file__)).split("/backend")[0]


def img_out_path():
    abs_path = app_abs_path()
    return f'{abs_path}/frontend/dist/tmp/img/out'


def img_in_path():
    abs_path = app_abs_path()
    return f'{abs_path}/frontend/dist/tmp/img/in'
