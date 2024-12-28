npm install
npm run build
npm run start.

Только там с призмой не та команда. После первого build измените в package.json скрипты prisma
"prisma": "npx prisma migrate dev --name init && npx prisma generate"
на
"prisma": "npx prisma migrate deploy && npx prisma generate"

## Стек
TypeScript, JavaScript, Html, EJS 

NodeJS, Prisma, Express.

Там еще небольшие библиотеки
