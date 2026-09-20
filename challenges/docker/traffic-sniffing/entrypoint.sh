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

# Toy "inventory-sync" server: accepts a connection, sends back an ack. All plaintext.
python3 - <<'PYEOF' &
import socket, sys, threading

def handle(conn):
    try:
        conn.recv(1024)
        conn.send(b"SYNC-ACK\r\n")
    finally:
        conn.close()

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
s.bind(("127.0.0.1", 8090))
s.listen(50)
while True:
    conn, _ = s.accept()
    threading.Thread(target=handle, args=(conn,), daemon=True).start()
PYEOF

sleep 1

# The client: reports "warehouse stock levels" to the sync server every few
# seconds, plaintext, including an internal auth token that never should have
# left a TLS tunnel.
cat > /opt/inventory-client.py <<'PYEOF'
import socket, sys
# The flag arrives on stdin - never on argv or in the environment, where any process listing
# would show it. It is only ever visible on the wire, which is the point of the exercise.
flag = sys.stdin.read().strip()
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
try:
    s.connect(("127.0.0.1", 8090))
    payload = f"POST /sync HTTP/1.1\r\nHost: inventory-sync.internal\r\nX-Auth-Token: {flag}\r\n\r\nstock=142;warehouse=3\r\n"
    s.send(payload.encode())
    s.recv(1024)
except OSError:
    pass
finally:
    s.close()
PYEOF

( while true; do
    printf '%s' "$FLAG_VALUE" | python3 /opt/inventory-client.py
    sleep 4
  done ) &

tail -f /dev/null
