FROM node:18

WORKDIR /usr/src/server

COPY package*.json ./

RUN npm ci

COPY . .
COPY ./src/.env ./src/.env

RUN npm run build

COPY ./src/.env ./dist/.env

EXPOSE 8080

# CMD ["sleep", "infinity"]
CMD [ "node", "dist/index.js" ]

