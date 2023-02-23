FROM node:18.14.2

# Essentials
# RUN apk add -U tzdata
# ENV TZ="Asia/Shanghai"
# RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

# production
ENV NODE_ENV=production
# We don't need the standalone Chromium
# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
# Install Chromium
# RUN apk add --no-cache \
#       chromium \
#       nss \
#       Xvfb \
#       freetype \
#       harfbuzz \
#       ca-certificates \
#       ttf-freefont 
# ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
    && sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-khmeros fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* 

# Set the DISPLAY environment variable & Start xvfb
ENV DISPLAY=:10
RUN Xvfb $DISPLAY -screen 0 1920x1080x16 &


# workdir
WORKDIR /app
ADD dist/ ./ 
COPY .env.sample ./.env
COPY package*.json ./

# RUN npm set-script prepare ''
RUN npm install --registry=https://registry.npm.taobao.org --ignore-scripts
# RUN apk update && apk add bash

EXPOSE 3000
ENTRYPOINT ["node", "main.js"]
