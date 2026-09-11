# Debug-simulator environment for "Перехват незашифрованного сетевого трафика". A
# background "sync client" repeatedly sends an unencrypted request carrying the
# flag to a local service over loopback. The participant captures it with tcpdump.
FROM alpine:3.20

RUN printf 'http://dl-cdn.alpinelinux.org/alpine/v3.20/main\nhttp://dl-cdn.alpinelinux.org/alpine/v3.20/community\n' > /etc/apk/repositories

RUN apk add --no-cache tcpdump python3 bash

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
