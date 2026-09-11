# Debug-simulator environment for "Чтение секретов контейнера через открытый
# Docker API". Rather than running a real nested dockerd (which would need
# --privileged and meaningfully weaken the sandbox), this serves a minimal mock of
# the two Docker Engine API endpoints the exercise actually needs
# (/containers/json, /containers/{id}/json) with a fabricated "payment-worker"
# container whose Env carries the flag — same discovery/exploitation experience,
# without giving the participant a real nested Docker daemon to escape from.
FROM alpine:3.20

RUN printf 'http://dl-cdn.alpinelinux.org/alpine/v3.20/main\nhttp://dl-cdn.alpinelinux.org/alpine/v3.20/community\n' > /etc/apk/repositories

RUN apk add --no-cache python3 curl bash

COPY app.py /srv/app.py
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
