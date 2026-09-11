#!/bin/sh
set -e
FLAG_VALUE="${FLAG:-MISSING_FLAG}"
ATTACKER_IP="10.13.37.13"

# Give the attacker its own address on loopback so `iptables -s $ATTACKER_IP -j DROP`
# has something real to match against.
ip addr add "${ATTACKER_IP}/32" dev lo label lo:atk 2>/dev/null || true

mkdir -p /var/log
: > /var/log/access.log

# Toy target service: appends every request's source IP to the log.
python3 - "$ATTACKER_IP" <<'PYEOF' &
import socket, sys, threading

def handle(conn, addr):
    try:
        conn.recv(1024)
        with open("/var/log/access.log", "a") as f:
            f.write(f"{addr[0]} GET /\n")
    finally:
        conn.close()

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
s.bind(("0.0.0.0", 9000))
s.listen(50)
while True:
    conn, addr = s.accept()
    threading.Thread(target=handle, args=(conn, addr), daemon=True).start()
PYEOF

sleep 1

# Simulated attacker: hammers the service from its dedicated source IP forever.
( while true; do
    python3 - "$ATTACKER_IP" <<'PYEOF'
import socket, sys
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
try:
    s.bind((sys.argv[1], 0))
    s.connect(("127.0.0.1", 9000))
    s.send(b"x")
except OSError:
    pass
finally:
    s.close()
PYEOF
    sleep 1
  done ) &

# Watcher: once an iptables rule actually drops the attacker's IP on INPUT, the
# access log stops growing — confirm it's been quiet for a few seconds, then hand
# over the flag.
QUIET_FOR=0
LAST_COUNT=-1
while true; do
  sleep 2
  COUNT=$(wc -l < /var/log/access.log)
  if [ "$COUNT" = "$LAST_COUNT" ]; then
    QUIET_FOR=$((QUIET_FOR + 2))
  else
    QUIET_FOR=0
  fi
  LAST_COUNT="$COUNT"
  if [ "$QUIET_FOR" -ge 6 ] && iptables -C INPUT -s "$ATTACKER_IP" -j DROP 2>/dev/null; then
    echo "$FLAG_VALUE" > /root/flag.txt
  fi
done
