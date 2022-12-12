FROM node:19-alpine

ENV TZ=Europe/Paris

RUN apk add --update tzdata
RUN npm install -g npm

WORKDIR /usr/src/app

COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

CMD [ "/entrypoint.sh" ]
