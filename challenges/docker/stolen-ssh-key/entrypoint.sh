#!/bin/sh
set -e
# The app hands the flag over as a one-shot file so it never sits in the container environment,
# where every participant shell would see it as $FLAG and in /proc/*/environ. $FLAG stays as a
# fallback for older callers.
if [ -r /.lenta-flag ]; then
  FLAG="$(cat /.lenta-flag)"
  rm -f /.lenta-flag
fi
FLAG_VALUE="${FLAG:-MISSING_FLAG}"
unset FLAG

mkdir -p /home/deploy/.ssh
ssh-keygen -t ed25519 -N '' -f /tmp/deploy_key -q -C 'deploy@storage-01'
cp /tmp/deploy_key.pub /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys

mkdir -p /srv/public-bucket/backups
cp /tmp/deploy_key /srv/public-bucket/backups/id_ed25519
chmod 644 /srv/public-bucket/backups/id_ed25519

echo "$FLAG_VALUE" > /home/deploy/flag.txt
chown deploy:deploy /home/deploy/flag.txt
chmod 600 /home/deploy/flag.txt

exec /usr/sbin/sshd -D
