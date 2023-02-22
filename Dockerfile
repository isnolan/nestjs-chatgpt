FROM node:lts-alpine

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
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
# Add user so we don't need --no-sandbox.
RUN addgroup -S pptruser && adduser -S -G pptruser pptruser \
    && mkdir -p /home/pptruser/Downloads /app \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app

# Run everything after as non-privileged user.
USER pptruser

# Set the DISPLAY environment variable & Start xvfb
ENV DISPLAY=:99
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
