FROM node:18

WORKDIR /app

COPY package*.json ./

ARG DATABASE_URL

ENV DATABASE_URL ${DATABASE_URL}

RUN npm install --legacy-peer-deps

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 3001

CMD ["node", "dist/src/main"]
