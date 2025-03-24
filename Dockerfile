FROM alpine:latest

WORKDIR /app

COPY .env.example .env

CMD ["cat", "/app/.env"]