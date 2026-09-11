# Debug-simulator environment for "Обновление уязвимой версии библиотеки в
# контейнере". A dependency manifest pins a version of lodash with a real,
# well-known published CVE (prototype pollution, fixed in 4.17.21). A watcher polls
# the manifest and hands over the flag once it's bumped to the patched version.
FROM alpine:3.20

RUN printf 'http://dl-cdn.alpinelinux.org/alpine/v3.20/main\nhttp://dl-cdn.alpinelinux.org/alpine/v3.20/community\n' > /etc/apk/repositories

RUN apk add --no-cache bash

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
