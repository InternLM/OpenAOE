FROM node:18-alpine AS frontend-builder
WORKDIR /app
COPY openaoe/frontend .
RUN npm install && npm run build

FROM python:3.9
WORKDIR /app
COPY --from=frontend-builder /app/dist /app/openaoe/frontend/dist
COPY openaoe/backend ./openaoe/backend
COPY openaoe/main.py ./openaoe
RUN pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -r openaoe/backend/requirements.txt
ENV CONFIG_PATH=/app/config.yaml
EXPOSE 10099
CMD ["python", "-u", "-m", "openaoe.main", "-f", "/app/config.yaml"]
