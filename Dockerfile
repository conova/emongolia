FROM node:20.9.0-slim

WORKDIR /usr/app

COPY package*.json ./

RUN npm install

COPY . .

RUN apt-get update && apt-get install -y openssl

RUN npx prisma generate --schema ./prisma/schema.prisma

RUN ["apt-get", "install", "-y", "vim"]


# Timezone
ENV TZ=Asia/Ulaanbaatar
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN npm run build

RUN cp -r templates/ dist/


CMD ["npm", "run", "start:migrate"]
EXPOSE 3000
