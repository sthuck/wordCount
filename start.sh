#!/bin/bash

export DB_PORT=32000
export PORT=8080

docker pull mysql:8
docker run -d -e "MYSQL_DATABASE=defaultDb" -e "MYSQL_USER=user" -e "MYSQL_PASSWORD=sa" -e "MYSQL_ROOT_PASSWORD=865#xcxd" -p $DB_PORT:3306/tcp mysql:8
npm run build
sleep 10s
DEBUG='WC:*'  node dist/src/index.js