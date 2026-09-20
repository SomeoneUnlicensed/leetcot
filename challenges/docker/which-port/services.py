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

import sys
import threading
from http.server import BaseHTTPRequestHandler

FLAG = sys.stdin.read().strip()


def make_handler(body):
    class Handler(BaseHTTPRequestHandler):
        def log_message(self, fmt, *args):
            pass

        def do_GET(self):
            data = body.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)

    return Handler


SERVICES = {
    5000: "healthcheck: ok\n",
    7431: "inventory-sync v2\nstatus: ok\nsync-token: " + FLAG + "\n",
    8000: "shop-frontend: ok\n",
    9100: "metrics: ok\n",
}

for port, body in SERVICES.items():
    server = FastHTTPServer(("127.0.0.1", port), make_handler(body))
    threading.Thread(target=server.serve_forever, daemon=True).start()

threading.Event().wait()
