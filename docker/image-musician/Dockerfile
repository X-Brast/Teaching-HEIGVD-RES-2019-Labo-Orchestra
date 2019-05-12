FROM node:8
MAINTAINER Alexandre Marques <alexandre.monteiromarques@heig-vd.ch>

COPY src /opt/app/

# Create app dir
WORKDIR /opt/app

RUN npm install

EXPOSE 2205

ENTRYPOINT ["node", "/opt/app/musician.js"]