#!/bin/sh
set -e
FLAG_VALUE="${FLAG:-MISSING_FLAG}"

# Toy "inventory-sync" server: accepts a connection, sends back an ack. All plaintext.
python3 - "$FLAG_VALUE" <<'PYEOF' &
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
( while true; do
    python3 - "$FLAG_VALUE" <<'PYEOF'
import socket, sys
flag = sys.argv[1]
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
    sleep 4
  done ) &

tail -f /dev/null
