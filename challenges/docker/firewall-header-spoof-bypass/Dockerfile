# Debug-simulator environment for "Обход фаервола с помощью подмены HTTP-
# заголовков". An internal API only serves the flag when it believes the request
# originates from an internal IP — but it trusts the client-supplied
# X-Forwarded-For header instead of the real socket peer address.
FROM alpine:3.20

RUN printf 'http://dl-cdn.alpinelinux.org/alpine/v3.20/main\nhttp://dl-cdn.alpinelinux.org/alpine/v3.20/community\n' > /etc/apk/repositories

RUN apk add --no-cache python3 curl bash

COPY app.py /srv/app.py
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
