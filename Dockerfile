FROM node:18-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN ls
COPY package.json package-lock.json ./
COPY .env .env   
RUN npm install

FROM node:18-alpine AS builder
ENV APP_ENV=development 
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /usr/app
ENV APP_ENV=development 
COPY --from=builder /app/build ./build
COPY package.json ./
COPY .env .env  
RUN npm install --prod
USER node
ENV NODE_ENV="production"

EXPOSE 3000

CMD ["npm", "start"]
