import os
from http.server import BaseHTTPRequestHandler, HTTPServer

ALLOWED_PREFIX = "10.0."
FLAG = os.environ.get("FLAG", "MISSING_FLAG")

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

if __name__ == "__main__":
    HTTPServer(("0.0.0.0", 8080), Handler).serve_forever()
