# Стадия сборки
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Стадия запуска
FROM nginx:alpine

# Копируем только собранные файлы в директорию по умолчанию
COPY --from=builder /app/dist /usr/share/nginx/html
COPY ./configs/nginx-default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
