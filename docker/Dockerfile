FROM node:18-alpine AS frontend-builder
WORKDIR /app
COPY openaoe/frontend .
RUN npm install && npm run build


FROM python:3.9
WORKDIR /app
COPY --from=frontend-builder /app/dist /app/frontend/dist
COPY openaoe/backend ./backend
COPY openaoe/main.py .
RUN pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -r backend/requirements.txt
ENV CONFIG_PATH=/app/config.yaml
EXPOSE 10099
CMD ["python", "-u", "/app/main.py", "-f", "/app/config.yaml"]

# docker run -p 10099:10099 -v /path/to/your/config-template.yaml:/app/config-template.yaml --name open-aoe open-aoe:latest
