FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3004

CMD ["npx", "expo", "start", "--web", "--port", "3004"]
