<div align="center">
  <img src="_static/image/aoe-logo.svg" width="250"/>

[![PyPI](https://img.shields.io/pypi/v/Open-AOE)](https://pypi.org/project/Open-AOE)
[![Docker Image Version (tag latest semver)](https://img.shields.io/docker/v/opensealion/open-aoe?label=docker)](https://hub.docker.com/r/opensealion/open-aoe?label=docker)


[English](../README.md) | 简体中文

</div>


## 最新进展 🎉

- \[2024/01\] 发布v0.0.1版本，正式开源。

______________________________________________________________________

# 简介
## 什么是 AOE？
AOE，取自 DOTA2 的技能范围伤害的简写：释放一个技能，可以对群体产生效果。
在这里，AOE 表示用户的一个 prompt 可以同时获得多个大模型的并行输出。
![](docs/_static/gif/aoe-zh_hans.gif)


## 为了解决了什么问题？
目前，市面上有很多基于 OpenAI 的聊天开源框架，但是，大模型群聊的开源框架还处于一个空白阶段。

AOE 的出现，填补了这个领域的空白：
AOE 可以帮助大模型算法研究、评测、工程开发人员甚至非专业人士，快速接入市面上的知名的商业大模型和开源大模型， 并提供了单模型串行回答和多模型并行回答两种模式。



## 可以提供什么服务？
1. 发送一次 prompt 同时给一个或者多个大语言模型，并获得其返回。
2. 提供商用大模型API的接入，默认支持gpt3.5、gpt4、Google Palm、Minimax、Claude、Spark等，也支持用户自定义接入其他大模型API。
3. 提供开源大模型API的接入，用户可以使用 [LMDeploy](https://github.com/InternLM/lmdeploy) 来一键部署开源大模型。
4. 我们同时提供了后端 API 和 WEB 端, 来满足不同用户的需求。





# 快速安装
我们将提供 3 种不同的方式安装：基于 pip、基于 docker 以及基于源代码，实现开箱即用。

## 基于 pip
> [!TIP]
> 需要 python >= 3.9
### **安装**
```shell
pip install -U open-aoe 
```
### **运行**
```shell
open-aoe -f /path/to/your/config-template.yaml
```

## 基于 docker
### **安装**
有两种方式获取 Open-AOE 的 docker 镜像：
1. 官方拉取
```shell
docker pull open-aoe:latest
```

2. 本地构建
```shell
git clone https://github.com/internlm/Open-AOE
cd open-aoe
docker build . -f docker/Dockerfile -t open-aoe:latest
```

### **运行**
```shell
docker run -p 10099:10099 -v /path/to/your/config-template.yaml:/app/config-template.yaml --name Open-AOE open-aoe:latest
```

## 基于源代码
### **安装**
1. 克隆项目
```shell
git clone https://github.com/internlm/Open-AOE
```
2. [_可选_] （如果前端代码发生变动）重新构建前端项目 
```shell
cd open-aoe/openaoe/frontend
npm install
npm run build
```


### **运行**
```shell
cd open-aoe/openaoe
pip install -r backend/requirements.txt
python -m main
``````

> [!TIP]
> `/path/to/your/config.yaml` 是 open-aoe 启动时读取的配置文件，里面包含了大模型的相关配置信息，
> 包括：调用API地址、AKSK、Token等信息，是 open-aoe 启动的必备文件。文件模板可以在 `openaoe/backend/config/config.yaml` 中找到。

# 二次开发
> **欢迎 fork，一起共建 ~**

如果想基于此项目做二次开发，下面这些信息将会对你有帮助。


## 技术栈
我们使用到的技术栈是：
1. 基于 Python + fastapi 的后端框架； 
2. 基于 Typescript + [Sealion-Client](https://github.com/OpenSealion/sealion-client) （基于React封装）+ [Sealion-UI](https://github.com/OpenSealion/sealion-ui) 的前端框架。
3. 构建工具：
   1. conda: 快速创建 python 环境来安装后端必要的依赖包
   2. npm: 构建前端项目 

> [!TIP]
> 构建工具可通过 [sealion-cli](https://github.com/opensealion/sealion-cli) 快速获得: `pip install -U sealion-cli`


## 整个仓库的简要说明
1. 前端代码在 openaoe/frontend 
2. 后端代码在 openaoe/backend
3. 项目入口文件在 openaoe/main.py


## 如何添加新的模型API？
### 前端
- 在 `openaoe/frontend/src/config/model-config.ts` 文件里面添加新模型的基本信息（用于展示），比如 `name`, `avatar`, `provider` 等。
- 在 `openaoe/frontend/src/config/api-config.ts` 文件里面添加新模型的API请求payload配置，比如 `url`, `method`, `parameter` 等。
- 在 `openaoe/frontend/src/services/fetch.ts` 文件里修改API和处理特殊情况, 以适配你的API定义.

