<div align="center">
  <img src="docs/_static/image/aoe-logo.svg" width="250"/>

[![PyPI](https://img.shields.io/pypi/v/Open-AOE)](https://pypi.org/project/Open-AOE)
[![Docker Image Version (tag latest semver)](https://img.shields.io/docker/v/opensealion/open-aoe?label=docker)](https://hub.docker.com/r/opensealion/open-aoe?label=docker)



English | [简体中文](docs/README_zh-CN.md)

</div>


## Latest Progress 🎉

- \[January 2024\] Released version v0.0.1, officially open-sourced！
______________________________________________________________________

# Introduction
## What is Open-AOE?
AOE, an acronym from DOTA2 for Area of Effect, denotes an ability that can affect a group of targets within a certain area.
Here, AOE in AI implies that user can obtain parallel outputs from multiple LLMs with one single prompt.

![](docs/_static/gif/aoe-en.gif)


## What problem does Open-AOE want to solve?
Currently, there are many open-source frameworks based on the ChatGPT for chat, but the open-sourced LGC(LLM Group Chat) framework 
 is still not coming yet.

The emergence of AOE fills this gap:
AOE can help large model algorithm researchers, evaluators, engineering developers, and even non-professionals to quickly access the market's well-known commercial and open-source large models, providing both single model serial response and multi-model parallel response modes.



## What can you get from Open-AOE?
1. Send a prompt once to one or more large language models and get their return.
2. Provides access to commercial large model APIs, with default support for gpt3.5, gpt4, Google Palm, Minimax, Claude, Spark, etc., and also supports user-defined access to other large model APIs.
3. Provides access to open-source large model APIs; users can use [LMDeploy](https://github.com/InternLM/lmdeploy) to deploy open-source large models with one click.
4. We also provide backend APIs and a WEB side to meet the needs of different users.





# Quick Run
We will provide three different ways to run open-aoe: run by pip， run by docker and run by source code as well.


## Run by pip 
> [!TIP]
> Require python >= 3.9
### **Install**
```shell
pip install -U open-aoe 
```
### **Start**
```shell
open-aoe -f /path/to/your/config-template.yaml
```

## Run by docker
### **Install**

There are two ways to get the Open-AOE docker image by:
1. pull the open-aoe docker image
```shell
docker pull open-aoe:latest
```

2. or build a docker image
```shell
git clone https://github.com/internlm/Open-AOE
cd open-aoe
docker build . -f docker/Dockerfile -t open-aoe:latest
```

### **Start**
```shell
docker run -p 10099:10099 -v /path/to/your/config-template.yaml:/app/config-template.yaml --name Open-AOE open-aoe:latest
```

## Run by source code
### **Install**
1. clone this project
```shell
git clone https://github.com/internlm/Open-AOE
```
2. [_optional_] build the frontend project when the frontend codes are changed
```shell
cd open-aoe/openaoe/frontend
npm install
npm run build
```


### **Start**
```shell
cd open-aoe/openaoe
pip install -r backend/requirements.txt
python -m main -f /path/to/your/config-template.yaml
```


> [!TIP]
> `/path/to/your/config.yaml` is the configuration file read by Open-AOE at startup, 
> containing the relevant configuration information for the large model, 
> including: API URLs, AKSKs, Tokens, etc., which are required for the startup of Open-AOE. 
> A template file can be found in `openaoe/backend/config/config.yaml`.


#  Tech Introduction
> **You are always welcome to fork this project and contribute your work**

If you want to add more LLMs' APIs or features based on Open-AOE, the following info might be helpful.

## Tech Stack
The technology stack we use includes:

1. Backend framework based on python + fastapi;
2. Frontend framework based on typescript + Sealion-Client (encapsulated based on React) + Sealion-UI.
3. Build tools:
   1. conda: quickly create a virtual python env to install necessary packages
   2. npm: build the frontend project

> [!TIP]
> The build tools can be installed by [sealion-cli](https://github.com/opensealion/sealion-cli) by `pip install -U sealion-cli`

## Organization of the Repo
- Frontend code in `openaoe/frontend`
- Backend code in `openaoe/backend`
- Project entry-point is `openaoe/main.py`

## How to add a new model
### Frontend
- Add new model info like `name`, `avatar`, `provider`, etc in `openaoe/frontend/src/config/model-config.ts`
- Add a new model basic API request payload configuration in `openaoe/frontend/src/config/api-config.ts`
- Modify your new model's payload specifically in `openaoe/frontend/src/services/fetch.ts`, you may need to change the payload structure and handle corner cases according to your model's API definition.
