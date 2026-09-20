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
  set +e
  while true; do
    sleep 2
    if ! kill -0 "$EVIL_PID" 2>/dev/null; then
      echo "$FLAG_VALUE" > /root/flag.txt
    fi
  done
) &

tail -f /dev/null
