FROM node:silm

# Essentials
RUN apk add -U tzdata
ENV TZ="Asia/Shanghai"
RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

# production
ENV NODE_ENV=production
# We don't need the standalone Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
# Install Chrome
# RUN apk update && apk upgrade 
# RUN apk add dpkg wget 
# RUN dpkg --add-architecture amd64
# RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
# RUN dpkg -i --force-architecture google-chrome-stable_current_amd64.deb
# RUN echo "Chrome: " && google-chrome --version

# Install Chromium
RUN apk update && apk add --no-cache nmap && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk update && \
    apk add --no-cache \
      chromium \
      harfbuzz \
      "freetype>2.8" \
      ttf-freefont \
      nss
      
RUN apk add --no-cache libxss1 
RUN apk add --no-cache libasound2 
RUN apk add --no-cache libatk-bridge2.0-0 
RUN apk add --no-cache libgtk-3-0 
RUN apk add --no-cache xvfb 
# Set the DISPLAY environment variable & Start xvfb
ENV DISPLAY=:99
RUN Xvfb $DISPLAY -screen 0 1920x1080x16 &

# workdir
WORKDIR /app
ADD dist/ ./ 
COPY .env.sample ./
COPY package*.json ./

# RUN npm set-script prepare ''
RUN npm install --registry=https://registry.npm.taobao.org --ignore-scripts
# RUN apk update && apk add bash

EXPOSE 3000
ENTRYPOINT ["node", "main.js"]
