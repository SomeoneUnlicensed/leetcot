# Debug-simulator environment for "Извлечение конфиденциальных файлов с
# незащищённого сетевого диска". A Samba (SMB) server is started with an
# anonymous-guest-accessible share — no username or password required. The
# flag sits inside a file on that share among realistic-looking warehouse
# backup files. The participant connects with smbclient from inside the same
# container (their own network namespace, loopback).
FROM alpine:3.20

RUN printf 'http://dl-cdn.alpinelinux.org/alpine/v3.20/main\nhttp://dl-cdn.alpinelinux.org/alpine/v3.20/community\n' > /etc/apk/repositories

RUN apk add --no-cache samba samba-client bash

COPY smb.conf /etc/samba/smb.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
