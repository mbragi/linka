FROM node:18-alpine

WORKDIR /app

COPY linka-adapter/package*.json ./
RUN npm ci --only=production

COPY linka-adapter/src/ ./src/
COPY linka-adapter/tsconfig.json ./

RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
