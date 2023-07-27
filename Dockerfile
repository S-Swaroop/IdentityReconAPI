FROM node:18

WORKDIR /usr/src/server

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 8080

# CMD ["sleep", "infinity"]
CMD [ "node", "dist/index.js" ]

