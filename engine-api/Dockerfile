FROM node:22-bookworm-slim

ENV PYTHON=python3
ENV PORT=10000
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 git ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY . /app
RUN npm run engine:setup && npm run inventory:skill

EXPOSE 10000
CMD ["python3", "engine-api/server.py"]
