#!/bin/sh
set -e

FLAG_VALUE="${FLAG:-MISSING_FLAG}"
echo "$FLAG_VALUE" > /home/weakuser/flag.txt
chown weakuser:weakuser /home/weakuser/flag.txt
chmod 600 /home/weakuser/flag.txt

exec /usr/sbin/sshd -D
