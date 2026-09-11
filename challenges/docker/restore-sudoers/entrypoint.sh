#!/bin/sh
set -e
FLAG_VALUE="${FLAG:-MISSING_FLAG}"

echo "$FLAG_VALUE" > /root/flag.txt
chmod 600 /root/flag.txt

# Corrupt sudoers the way a bad find/replace during config migration would:
# a stray unescaped line breaks the whole file, so `sudo` refuses to run at all
# until it's fixed (any syntax error anywhere in /etc/sudoers disables sudo
# entirely, not just the broken line).
cat > /etc/sudoers <<'SUDOERS'
root ALL=(ALL) ALL
this line is not valid sudoers syntax at all
%wheel ALL=(ALL) ALL
SUDOERS
chmod 440 /etc/sudoers

# Without working sudo, ops needs another way to run something as root — a
# root-owned cron job keeps polling a healthcheck script that was left
# world-writable (a real, common misconfiguration, and the intended way in:
# edit the script, wait for cron to run it as root, fix /etc/sudoers that way).
mkdir -p /usr/local/bin /etc/crontabs
cat > /usr/local/bin/healthcheck.sh <<'SH'
#!/bin/sh
echo "$(date -u +%FT%TZ) healthcheck ok" >> /var/log/healthcheck.log
SH
chmod 777 /usr/local/bin/healthcheck.sh
: > /var/log/healthcheck.log
chmod 666 /var/log/healthcheck.log

echo '* * * * * /usr/local/bin/healthcheck.sh' > /etc/crontabs/root
crond -b -L /var/log/cron.log

# The sandbox runs every environment with no-new-privileges, which correctly
# blocks setuid escalation (sudo itself included) even once the config is
# valid again — so success here is judged by the config being fixed (valid
# syntax, ops covered), not by literally invoking `sudo`. Once that's true,
# unlock the flag for ops to read directly.
(
  set +e
  while true; do
    sleep 2
    if visudo -c -f /etc/sudoers >/dev/null 2>&1 && grep -q '^%wheel' /etc/sudoers 2>/dev/null; then
      cp /root/flag.txt /tmp/flag.txt
      chmod 644 /tmp/flag.txt
    fi
  done
) &

su - ops -c 'sleep infinity'
