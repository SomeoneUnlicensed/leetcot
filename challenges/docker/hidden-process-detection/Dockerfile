# Debug-simulator environment for "Обнаружение и остановка скрытого фонового
# процесса". A background loop process disguises itself with a kernel-worker-style
# name to blend into `ps aux` output while eating CPU. Killing it releases the flag.
FROM alpine:3.20

RUN printf 'http://dl-cdn.alpinelinux.org/alpine/v3.20/main\nhttp://dl-cdn.alpinelinux.org/alpine/v3.20/community\n' > /etc/apk/repositories

RUN apk add --no-cache bash procps

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
