# Debug-simulator environment for "Получение доступа к системе через обратное
# подключение". A vulnerable internal service accepts a callback host:port and
# genuinely connects out to it, handing over an interactive shell — the classic
# reverse-shell technique. The flag is only written once a real connection back
# succeeds, so it can't be skipped by just being root in your own session.
FROM alpine:3.20

RUN printf 'http://dl-cdn.alpinelinux.org/alpine/v3.20/main\nhttp://dl-cdn.alpinelinux.org/alpine/v3.20/community\n' > /etc/apk/repositories

RUN apk add --no-cache python3 curl netcat-openbsd bash

COPY app.py /srv/app.py
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
