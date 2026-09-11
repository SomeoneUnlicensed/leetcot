#!/bin/sh
set -e
FLAG_VALUE="${FLAG:-MISSING_FLAG}"

mkdir -p /var/tmp/.cache
mkdir -p /usr/lib/.cache-worker
cat > /usr/lib/.cache-worker/agent.sh <<'SH'
#!/bin/sh
i=0
while true; do i=$((i+1)); done
SH
chmod +x /usr/lib/.cache-worker/agent.sh

/usr/lib/.cache-worker/agent.sh &
EVIL_PID=$!
echo "$EVIL_PID" > /var/tmp/.cache/.pid

(
  while true; do
    sleep 2
    if ! kill -0 "$EVIL_PID" 2>/dev/null; then
      echo "$FLAG_VALUE" > /root/flag.txt
    fi
  done
) &

tail -f /dev/null
