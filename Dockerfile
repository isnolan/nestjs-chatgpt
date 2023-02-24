FROM node:lts-alpine

# Essentials
RUN apk add -U tzdata
ENV TZ="Asia/Shanghai"
RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

# Install Chromium
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      xvfb 

# workdir
WORKDIR /app
ADD dist/ ./ 
COPY .env.sample ./.env
COPY package*.json ./

# Set the DISPLAY environment variable & Start xvfb
RUN Xvfb :10 -screen 0 1920x1080x16 & 

# production
ENV NODE_ENV=production
ENV PUPPETEER_EXECUTABLE_PATH=/usr/lib/chromium/chrome
RUN npm install --registry=https://registry.npm.taobao.org --ignore-scripts


EXPOSE 3000
ENTRYPOINT ["node", "main.js"]
