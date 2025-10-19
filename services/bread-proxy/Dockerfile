FROM node:18-alpine

WORKDIR /app

COPY services/bread-proxy/package*.json ./
RUN npm ci --only=production

COPY services/bread-proxy/src/ ./src/

EXPOSE 8080

CMD ["node", "src/index.js"]
