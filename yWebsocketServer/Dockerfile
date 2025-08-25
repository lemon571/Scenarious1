FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .
ENV Y_WEBSOCKET_PORT=1234
EXPOSE 1234
CMD ["node", "app.js"]
