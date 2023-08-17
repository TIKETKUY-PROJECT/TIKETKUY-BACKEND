FROM node:18

WORKDIR /app

COPY package*.json ./

ARG NODE_ENV
ARG DATABASE_URL
ARG JWT_SECRET
ARG SALT_ROUNDS

ENV NODE_ENV ${NODE_ENV}
ENV DATABASE_URL ${DATABASE_URL}
ENV JWT_SECRET ${JWT_SECRET}
ENV SALT_ROUNDS ${SALT_ROUNDS}

RUN npm install --legacy-peer-deps
RUN npm i -g --legacy-peer-deps @nestjs/cli
RUN npm i --save-dev --legacy-peer-deps @types/node

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 3001

CMD ["node", "dist/src/main"]
