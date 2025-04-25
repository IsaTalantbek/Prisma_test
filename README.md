## Запуск
Перед запуском укажите в .env значения для DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, PORT

npm install

npm run build.

npm run start.

Только там с призмой не та команда. После первого build измените в package.json скрипты prisma

"prisma": "npx prisma migrate dev --name init && npx prisma generate"

на

"prisma": "npx prisma migrate deploy && npx prisma generate"

## Стек

# Фронт
JavaScript, Html, CSS, EJS (Тут я все у чат гпт списал, не фронтендер сори)

# Бэк
TypeScript, NodeJS, Prisma, Express.


Там еще небольшие библиотеки
