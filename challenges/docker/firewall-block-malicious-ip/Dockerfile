# Debug-simulator environment for "Настройка фаервола для блокировки входящего
# вредоносного IP-трафика". A background "attacker" script continuously hits a
# local service from a fixed source IP on a dedicated loopback alias. A watcher
# polls iptables and drops the flag into a file once that IP is actually blocked.
FROM alpine:3.20

RUN printf 'http://dl-cdn.alpinelinux.org/alpine/v3.20/main\nhttp://dl-cdn.alpinelinux.org/alpine/v3.20/community\n' > /etc/apk/repositories

RUN apk add --no-cache iptables python3 bash

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
