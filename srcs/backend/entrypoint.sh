#!/bin/sh
npm install
npx prisma generate
npx prisma db push
npx prisma migrate deploy
npm run start:dev
