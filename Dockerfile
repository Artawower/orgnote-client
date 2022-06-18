FROM node:16
WORKDIR /app
COPY package*.json ./
RUN yarn global add @quasar/cli
RUN yarn
COPY . .
