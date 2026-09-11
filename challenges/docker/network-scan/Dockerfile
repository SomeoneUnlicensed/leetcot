# Debug-simulator environment for "Сканирование сети и обнаружение открытых портов
# и сервисов". The participant lands in this container as root and is expected to
# scan localhost (their own network namespace) to discover a hidden service on a
# non-standard port whose connection banner carries the flag, alongside a decoy
# HTTP service for realism.
FROM alpine:3.20

RUN printf 'http://dl-cdn.alpinelinux.org/alpine/v3.20/main\nhttp://dl-cdn.alpinelinux.org/alpine/v3.20/community\n' > /etc/apk/repositories

RUN apk add --no-cache nmap socat python3 bash

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
