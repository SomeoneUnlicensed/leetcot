# Debug-simulator environment for the final task, "Восстановление упавшего
# реплицируемого узла". Two Redis instances run as master (6379) and replica
# (6380); the replica is deliberately pointed at the wrong master port so
# replication is down. Reconnecting it correctly (REPLICAOF) releases the flag.
FROM alpine:3.20

RUN printf 'http://dl-cdn.alpinelinux.org/alpine/v3.20/main\nhttp://dl-cdn.alpinelinux.org/alpine/v3.20/community\n' > /etc/apk/repositories

RUN apk add --no-cache redis bash

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
