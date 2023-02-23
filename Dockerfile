FROM node:18.14.2

# Essentials
RUN apk add -U tzdata
ENV TZ="Asia/Shanghai"
RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

# production
ENV NODE_ENV=production
# We don't need the standalone Chromium
# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
# Install Chromium
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont 
RUN apk add --no-cache Xvfb
ENV PUPPETEER_EXECUTABLE_PATH=/usr/lib/chromium/chrome


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
