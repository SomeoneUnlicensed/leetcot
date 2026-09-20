import os
import socketserver
from http.server import BaseHTTPRequestHandler, HTTPServer

ALLOWED_PREFIX = "10.0."
def _load_flag():
    # The task runner hands the flag over as a one-shot file so it never sits in the container
    # environment (visible to every shell as $FLAG and in /proc/*/environ).
    try:
        with open("/.lenta-flag") as f:
            flag = f.read().strip()
        os.remove("/.lenta-flag")
        return flag
    except OSError:
        return os.environ.pop("FLAG", "MISSING_FLAG")


FLAG = _load_flag()

class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass

    def do_GET(self):
        if self.path != "/internal/status":
            self.respond(404, b"Not found")
            return

        # Vulnerable: trusts the client-supplied header over the real peer address.
        xff = self.headers.get("X-Forwarded-For", "")
        client_ip = xff.split(",")[0].strip() if xff else self.client_address[0]

        if client_ip.startswith(ALLOWED_PREFIX):
            self.respond(200, f"internal ok\nflag={FLAG}\n".encode())
        else:
            self.respond(403, b"Forbidden: internal network only\n")

    def respond(self, code, body):
        self.send_response(code)
        self.send_header("Content-Type", "text/plain")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

class FastHTTPServer(HTTPServer):
    # HTTPServer.server_bind() reverse-resolves the bind address with socket.getfqdn(), which
    # blocks for ~5 s in a container without network before the port starts listening.
    def server_bind(self):
        socketserver.TCPServer.server_bind(self)
        host, port = self.server_address[:2]
        self.server_name = host
        self.server_port = port


if __name__ == "__main__":
    FastHTTPServer(("0.0.0.0", 8080), Handler).serve_forever()
