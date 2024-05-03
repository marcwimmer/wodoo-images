FROM node:22-alpine
COPY app/ /usr/src/app/
WORKDIR /usr/src/app
RUN npm install -g
RUN npm install express
CMD [ "npm", "start" ]
