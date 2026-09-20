import socketserver
from http.server import HTTPServer


class FastHTTPServer(HTTPServer):
    # HTTPServer.server_bind() reverse-resolves the address (socket.getfqdn), which blocks for ~5 s
    # in a container without network before the port starts listening.
    def server_bind(self):
        socketserver.TCPServer.server_bind(self)
        host, port = self.server_address[:2]
        self.server_name = host
        self.server_port = port

import json
import sys
from http.server import BaseHTTPRequestHandler

FLAG = sys.stdin.read().strip()
CONTAINER_ID = "a1b2c3d4e5f6"

LIST = [
    {"Id": CONTAINER_ID, "Names": ["/payment-worker"], "Image": "internal/payment-worker:2.3.1", "State": "running"},
    {"Id": "f6e5d4c3b2a1", "Names": ["/nginx-edge"], "Image": "nginx:1.25", "State": "running"},
]

INSPECT = {
    "Id": CONTAINER_ID,
    "Name": "/payment-worker",
    "State": {"Status": "running", "Running": True},
    "Config": {
        "Image": "internal/payment-worker:2.3.1",
        "Env": [
            "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin",
            "PAYMENT_PROVIDER=internal-gateway",
            "DEBUG_TOKEN=" + FLAG,
        ],
    },
}


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass

    def do_GET(self):
        if self.path in ("/containers/json", "/v1.44/containers/json"):
            self.reply(200, LIST)
        elif self.path in ("/containers/%s/json" % CONTAINER_ID, "/v1.44/containers/%s/json" % CONTAINER_ID):
            self.reply(200, INSPECT)
        else:
            self.reply(404, {"message": "no such container"})

    def reply(self, code, payload):
        body = json.dumps(payload, indent=2).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


FastHTTPServer(("127.0.0.1", 2375), Handler).serve_forever()
