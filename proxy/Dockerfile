FROM node:22-alpine
COPY app/ /usr/src/app/
WORKDIR /usr/src/app
RUN npm install -g
RUN npm install express
RUN apk update; apt upgrade; apk add git
RUN git clone https://github.com/Odoo-Ninjas/node-http-proxy.git
RUN npm install "Odoo-Ninjas/node-http-proxy#zebroo-cicd"
RUN find / -name web-outgoing.js
CMD [ "npm", "start" ]
