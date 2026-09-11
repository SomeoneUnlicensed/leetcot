# Debug-simulator environment for "Восстановление прав доступа после случайного
# изменения /etc/sudoers". The participant lands as an UNprivileged user (ops)
# whose sudo access is broken by a corrupted /etc/sudoers — they need to fix it
# without breaking it further (a bad edit can lock sudo out entirely), then sudo
# to read the flag.
FROM alpine:3.20

RUN printf 'http://dl-cdn.alpinelinux.org/alpine/v3.20/main\nhttp://dl-cdn.alpinelinux.org/alpine/v3.20/community\n' > /etc/apk/repositories

RUN apk add --no-cache sudo bash \
    && adduser -D ops \
    && passwd -u ops \
    && echo '%wheel ALL=(ALL) ALL' > /etc/sudoers.d/wheel \
    && addgroup ops wheel

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
