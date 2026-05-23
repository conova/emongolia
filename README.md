# RESTful API Node adventure Template

> A adventure template/starter project for quickly building RESTful APIs using Node.js, Express, and PostreSQL with Prisma.

Template boilerplate project for create new service on NodeJs.

    - dockerized
    - log format
    - exception handler
    - health check route
    - commitlint

## Install dependencies

-   Docker
-   NodeJs 16.15.1
-   npm 8.11.0

```bash
npm install
# for development on local machine
```

## Set the environment variables:

```sh
cp .env.dist .env
# open .env and modify the environment variables (if needed)

docker-compose build
docker-compose up -d
```

## Table of Contents

-   [Setup Database](#setup-database)
-   [Coding Standart](#coding-standart)

## Setup database

```sh
docker exec -it <node_app_container_id> sh
# Once inside docker container

npx prisma migrate dev --name init
```

## Coding standart

To check coding standart

```sh
npm run prettier
```

Auto fix coding standart

```sh
npm run prettier:fix
```
