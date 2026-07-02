FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN apk add --no-cache netcat-openbsd \
  && npm install --omit=dev

COPY . .
RUN chmod +x /app/docker-entrypoint.sh

ENV NODE_ENV=production

EXPOSE 4001
ENTRYPOINT ["sh", "/app/docker-entrypoint.sh"]
CMD ["npm", "start"]
