FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* /app/
RUN npm install
COPY index.html vite.config.js /app/
COPY src /app/src
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist /app/dist
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
