FROM node:22-bookworm-slim

ENV PYTHON=python3
ENV PORT=10000
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 git ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY . /app
RUN npm run engine:setup \
    && test -f /app/.agents/skills/ui-ux-pro-max/scripts/search.py \
    && python3 /app/scripts/capability-inventory.py /app/generated/skill-capability-inventory.json \
    && test -s /app/generated/skill-capability-inventory.json

EXPOSE 10000
CMD ["python3", "engine-api/server.py"]
