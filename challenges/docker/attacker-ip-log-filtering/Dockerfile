# Debug-simulator environment for "Фильтрация логов доступа для поиска
# атакующего". A pre-seeded nginx-style access.log mixes normal store traffic with
# a burst of scanning requests from one IP; the flag is embedded in that IP's final
# request (a query string parameter), simulating an attacker probing with a token.
FROM alpine:3.20

RUN printf 'http://dl-cdn.alpinelinux.org/alpine/v3.20/main\nhttp://dl-cdn.alpinelinux.org/alpine/v3.20/community\n' > /etc/apk/repositories

RUN apk add --no-cache python3 bash

COPY generate_log.py /srv/generate_log.py
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
