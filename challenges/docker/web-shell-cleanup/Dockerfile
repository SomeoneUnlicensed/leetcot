# Debug-simulator environment for "Поиск и удаление загруженного веб-шелла". A
# small static site directory has a malicious PHP-looking webshell planted among
# normal files. A watcher confirms it's actually been deleted before releasing the
# flag (not just renamed/hidden).
FROM alpine:3.20

RUN printf 'http://dl-cdn.alpinelinux.org/alpine/v3.20/main\nhttp://dl-cdn.alpinelinux.org/alpine/v3.20/community\n' > /etc/apk/repositories

RUN apk add --no-cache bash findutils

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
