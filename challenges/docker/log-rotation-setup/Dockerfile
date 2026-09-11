# Debug-simulator environment for "Настройка правил ротации логов для
# предотвращения переполнения диска". A log file has grown huge and unrotated; the
# participant is expected to write a logrotate config and force a rotation. A
# watcher confirms an actual rotated+compressed file appeared and the live log
# shrank before handing over the flag.
FROM alpine:3.20

RUN printf 'http://dl-cdn.alpinelinux.org/alpine/v3.20/main\nhttp://dl-cdn.alpinelinux.org/alpine/v3.20/community\n' > /etc/apk/repositories

RUN apk add --no-cache logrotate bash

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
