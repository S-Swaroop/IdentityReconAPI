FROM node:18

WORKDIR /usr/src/server

COPY package*.json ./

RUN npm ci

COPY . .
COPY ./src/.env ./src/.env

RUN npm run build

EXPOSE 8080
# CMD [ "TZ='UTC' nodemon" ]
CMD [ "node", "./dist/index.js" ]

