FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* /app/
RUN npm install --production
COPY src /app/src
CMD ["node", "src/index.js"]
