# Debug-simulator environment for "Подключение к незащищённой базе данных".
# A Redis instance is started with no authentication and protected-mode off; the
# flag is seeded as the value of a realistic-looking key. The participant connects
# with redis-cli from inside the same container (their own network namespace).
FROM alpine:3.20

RUN printf 'http://dl-cdn.alpinelinux.org/alpine/v3.20/main\nhttp://dl-cdn.alpinelinux.org/alpine/v3.20/community\n' > /etc/apk/repositories

RUN apk add --no-cache redis bash

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
