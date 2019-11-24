FROM node:12.13.1-alpine

WORKDIR /usr/app

RUN apk add yarn

COPY package.json yarn.lock ./
RUN yarn

COPY . .
