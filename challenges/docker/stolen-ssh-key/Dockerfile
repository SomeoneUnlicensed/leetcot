# Debug-simulator environment for "Подключение к серверу с помощью украденного
# приватного SSH-ключа". A "deploy" user only accepts key-based auth; the matching
# private key is left in a world-readable "public bucket" path inside the same
# container, simulating a leaked credential. The flag sits in deploy's home dir.
FROM alpine:3.20

RUN printf 'http://dl-cdn.alpinelinux.org/alpine/v3.20/main\nhttp://dl-cdn.alpinelinux.org/alpine/v3.20/community\n' > /etc/apk/repositories

RUN apk add --no-cache openssh bash \
    && ssh-keygen -A \
    && adduser -D deploy \
    && passwd -u deploy \
    && echo "PermitRootLogin no" >> /etc/ssh/sshd_config \
    && echo "PasswordAuthentication no" >> /etc/ssh/sshd_config \
    && echo "PubkeyAuthentication yes" >> /etc/ssh/sshd_config

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
