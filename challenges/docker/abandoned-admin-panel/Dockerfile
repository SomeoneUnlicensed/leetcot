# Debug-simulator environment for "Поиск заброшенного сервиса или админки на
# нестандартном порту". A static legacy admin panel is served on a non-standard,
# undocumented port. The flag is visible directly in the page content once found.
FROM alpine:3.20

RUN printf 'http://dl-cdn.alpinelinux.org/alpine/v3.20/main\nhttp://dl-cdn.alpinelinux.org/alpine/v3.20/community\n' > /etc/apk/repositories

RUN apk add --no-cache python3 nmap bash

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
