FROM node:slim
# Essentials
RUN apk add -U tzdata
ENV TZ="Asia/Shanghai"
RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

# production
ENV NODE_ENV=production
# We don't need the standalone Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Install Google Chrome Stable and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.
RUN apt-get update && apt-get install gnupg wget -y && \
  wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
  sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
  apt-get update && \
  apt-get install google-chrome-stable -y --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

# workdir
WORKDIR /app
ADD dist/ ./ 
# COPY .env ./
# COPY .env.production ./
COPY package*.json ./

# RUN npm set-script prepare ''
RUN npm ci --registry=https://registry.npm.taobao.org --ignore-scripts
# RUN apk update && apk add bash

ENTRYPOINT ["npm", "run", "start:prod"]
