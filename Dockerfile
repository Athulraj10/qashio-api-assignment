FROM node:22.8.0

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .


RUN npm install -g ts-node-dev


EXPOSE 3000


CMD ["npm", "run", "start:dev"]
