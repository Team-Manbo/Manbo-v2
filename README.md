# Guideline

## docker cli

### **twilight**

`docker build -f Dockerfile . --tag core:twilight --no-cache`
`docker run --rm -d -p 6972:80 --env-file .env --name twilight core:twilight`

### **jobs**

`docker build -f Dockerfile . --tag core:jobs --no-cache`
`docker run --rm -d -p 6974:6974 --env-file .env --name jobs --link redis:redis --link postgres:postgres --net database_default --env docker=true --env version=v2 core:jobs`

### **bot**

`docker build -f Dockerfile . --tag core:bot --no-cache`

-   no1:

`docker run --rm -d -p 7777:7777 --env-file .env --name bot1 --link redis:redis --link postgres:postgres --net database_default --env docker=true --env uuid=no1 --env version=v2 core:bot`

-   no2:

`docker run --rm -d -p 7777:7777 --env-file .env --name bot2 --link redis:redis --link postgres:postgres --net database_default --env docker=true --env uuid=no2 --env version==v2 core:bot`

### **database**

`docker compose up --build --no-cache`

`docker compose up -d`

### **lavalink**

`docker pull fredboat/lavalink`

`docker run --rm -d -p 3333:3333 -v application.yml:/opt/Lavalink/application.yml --name lavalink fredboat/lavalink:latest`

### **docker**

`docker image ls`

`docker system df`

`docker system prune (-a)`

-   remove errored <none> image

`docker rmi $(docker images -f "dangling=true" -q)`

<br>
<br>

## How to setup docker

### 1. launch database (redis / postgres)

-   Add additional database settings in [here](/database/postgres/init.sql)
-   Check [docker-compose.yml](/database/docker-compose.yml) setting
-   Run `docker run blablabla`

### 2. Launch twilight (if needed)

-   Set `USE_TWILIGHT` to `true` in [bot's env file](/bot/.env)
-   SET `USE_TWILIGHT` to `true` in [job's env file](/jobs/.env)
-   If you set `USE_TWILIGHT` to `true`, also set `TWILIGHT_HOST` and `TWILIGHT_PORT`
-   If not, just ignore this whole path

-   Check [Dockerfile](/twilight/Dockerfile) setting
-   Run `docker run blabla`

### 3. Launch Jobs (Websocket Server and etc)

-   Check [Dockerfile](/jobs/Dockerfile) for jobs
-   Run `docker run blabla`

### 4. Launch App (Websocket Client, Discord Application, etc)

-   Check [Dockerfile](/bot/Dockerfile) for app
-   Run `docker run blabla`

## Building your own twilight

-   For non-metrics twilight-http-proxy, execute
-   `cargo build --release` and
-   `BOT_TOKEN="your bot token" PORT="port to expose, see Dockerfile" ./target/release/twilight-http-proxy`

-   For metrics twilight-http-proxy, execute
-   `cargo build --release --features expose-metrics` and
-   `BOT_TOKEN="your bot token" PORT="port to expose, see Dockerfile" ./target/release/twilight-http-proxy`
