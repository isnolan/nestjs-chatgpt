FROM node:19.4.0-alpine
# Essentials
RUN apk add -U tzdata
ENV TZ="Asia/Shanghai"
RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

# production
ENV NODE_ENV=production

# workdir
WORKDIR /app
ADD dist/ ./ 
COPY .env ./
COPY .env.production ./
COPY package*.json ./

# RUN npm set-script prepare ''
RUN npm ci --registry=https://registry.npm.taobao.org --ignore-scripts
# RUN apk update && apk add bash

ENTRYPOINT ["npm", "run", "start:prod"]
