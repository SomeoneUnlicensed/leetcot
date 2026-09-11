# Debug-simulator environment for "Внедрение OS-команд через утилиту проверки
# связи". A pure-stdlib web app exposes a "ping this host" form that shells out to
# the system ping using naive string concatenation — classic OS command injection.
FROM alpine:3.20

RUN printf 'http://dl-cdn.alpinelinux.org/alpine/v3.20/main\nhttp://dl-cdn.alpinelinux.org/alpine/v3.20/community\n' > /etc/apk/repositories

RUN apk add --no-cache python3 curl bash iputils

COPY app.py /srv/app.py
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
