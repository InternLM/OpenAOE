#!/usr/bin/env python3

import argparse
import os
import sys
from copy import deepcopy

import yaml

from openaoe.backend.util.log import log

logger = log(__name__)
BIZ_CONFIG = None


class BizConfig:
    def __init__(self, **args):
        # raw dict
        self.__dict__.update(args)

    # provider -> model_name -> ModelConfig
    @property
    def models_map(self):
        if "models" not in self.__dict__:
            return {}

        models_dict = self.__dict__["models"]
        ret = {}
        for model_name, model_config in models_dict.items():
            if model_config["provider"] not in ret:
                ret[model_config["provider"]] = {}
            ret[model_config["provider"]][model_name] = ModelConfig(model_config["webui"], model_config["api"])
        return ret

    @models_map.getter
    def __get_models_map(self):
        return self.models_map

    @property
    def json(self):
        ret = deepcopy(self.__dict__)
        if "models" in ret:
            models_config = ret["models"]
        for model_name, config in models_config.items():
            config.pop("api")
            ret["models"][model_name] = config
        return ret


class ModelConfig:
    def __init__(self, webui_config, api_config):
        self.webui_config = webui_config
        self.api_config = api_config


def init_config() -> BizConfig:
    parser = argparse.ArgumentParser(description="LLM group chat framework")
    parser.add_argument('-f', '--file', type=str, required=True, help='Path to the YAML config file.')
    config_path = parser.parse_args()
    logger.info(f"your config file is: {config_path.file}")
    return load_config(config_path.file)


def load_config(config_path) -> BizConfig:
    logger.info(f"start to init configuration from {config_path}.")
    if not os.path.isfile(config_path):
        logger.error(f"invalid path: {config_path}, not exist or not file")
        sys.exit(-1)

    with open(config_path) as fin:
        m = yaml.safe_load(fin)
        if not m or len(m) == 0:
            logger.error("init configuration failed. Exit")
            sys.exit(-1)

        global BIZ_CONFIG
        BIZ_CONFIG = BizConfig(**m)
    logger.info("init configuration successfully.")
    return BIZ_CONFIG


def get_model_configuration(provider: str, field, model_name: str = None):
    models = BIZ_CONFIG.models_map
    if not models:
        logger.error(f"invalid configuration file")
        sys.exit(-1)

    provider_config = models.get(provider)
    if provider_config:
        if model_name:
            try:
                return provider_config.get(model_name).api_config.get(field)
            except:
                for config_model_name, config in provider_config.items():
                    if config_model_name.startswith(model_name):
                        return config.api_config.get(field)
                logger.error(f"{provider} get field: {field} for model: {model_name} failed")
                return ""
        elif not model_name:
            # default the first provider ModelConfig
            provider_models_config_list = list(provider_config.values())
            try:
                logger.info(f"{provider} get field: {field} for anonymous model, use the first one as default.")
                return provider_models_config_list[0].api_config.get(field)
            except:
                logger.error(f"{provider} get field: {field} for anonymous model failed")
                return ""

    logger.error(f"provider: {provider} has no field: {field} configuration for model: {model_name}")
    return ""


def get_base_url(provider: str, model_name: str = None) -> str:
    return get_model_configuration(provider, "api_base", model_name)


def get_api_key(provider: str, model_name: str = None) -> str:
    return get_model_configuration(provider, "api_key", model_name)


def app_abs_path():
    return os.path.dirname(os.path.abspath(__file__)).split("/backend")[0]


def img_out_path():
    abs_path = app_abs_path()
    return f'{abs_path}/frontend/dist/tmp/img/out'


def img_in_path():
    abs_path = app_abs_path()
    return f'{abs_path}/frontend/dist/tmp/img/in'
