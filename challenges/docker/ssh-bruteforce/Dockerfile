# Debug-simulator environment for "Взлом слабого SSH-пароля методом подбора".
#
# The participant lands in this container's shell as root (via `docker exec`) and is
# expected to attack the SSH server running inside the SAME container: find the weak
# password for `weakuser` (by hand or with hydra) and read the flag from their home
# directory. The flag itself is never baked into the image — it's injected at
# container-start time via the FLAG env var (see environments.ts) so the image can be
# reused across events/deployments without leaking the answer through `docker pull`.
FROM alpine:3.20

RUN printf 'http://dl-cdn.alpinelinux.org/alpine/v3.20/main\nhttp://dl-cdn.alpinelinux.org/alpine/v3.20/community\n' > /etc/apk/repositories

RUN apk add --no-cache openssh hydra sshpass bash \
    && ssh-keygen -A \
    && adduser -D weakuser \
    && echo "weakuser:123456" | chpasswd \
    && echo "PasswordAuthentication yes" >> /etc/ssh/sshd_config \
    && echo "PermitRootLogin no" >> /etc/ssh/sshd_config \
    && printf '%s\n' weakuser >> /usr/share/common-users.txt \
    && printf '123456\n12345\npassword\nletmein\nqwerty\n123456789\n' > /usr/share/common-passwords.txt

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
