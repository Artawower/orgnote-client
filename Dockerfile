FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN yarn global add @quasar/cli
COPY . .
