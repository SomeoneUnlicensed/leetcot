# Debug-simulator environment for "Чтение конфигов через уязвимость выхода за
# пределы директории". A tiny Flask-less pure-stdlib web app serves files from a
# "webroot" but naively concatenates the user-supplied filename, allowing ../
# traversal to a config file outside it that holds the flag.
FROM alpine:3.20

RUN printf 'http://dl-cdn.alpinelinux.org/alpine/v3.20/main\nhttp://dl-cdn.alpinelinux.org/alpine/v3.20/community\n' > /etc/apk/repositories

RUN apk add --no-cache python3 curl bash

COPY app.py /srv/app.py
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
