import subprocess
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

FORM = b"""<!doctype html><html><body>
<h1>\xd0\x9f\xd1\x80\xd0\xbe\xd0\xb2\xd0\xb5\xd1\x80\xd0\xba\xd0\xb0 \xd1\x81\xd0\xb2\xd1\x8f\xd0\xb7\xd0\xb8</h1>
<form method="get" action="/ping"><input name="host" value="127.0.0.1"><button>Ping</button></form>
</body></html>"""

class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/":
            self.respond(200, "text/html", FORM)
            return
        if parsed.path == "/ping":
            qs = parse_qs(parsed.query)
            host = qs.get("host", [""])[0]
            if not host:
                self.respond(400, "text/plain", b"Missing ?host=")
                return
            # Vulnerable: user input concatenated straight into a shell command.
            cmd = "ping -c 1 " + host
            try:
                out = subprocess.run(["sh", "-c", cmd], capture_output=True, timeout=5)
                body = out.stdout + out.stderr
            except Exception as e:
                body = str(e).encode()
            self.respond(200, "text/plain", body)
            return
        self.respond(404, "text/plain", b"Not found")

    def respond(self, code, ctype, body):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

if __name__ == "__main__":
    HTTPServer(("0.0.0.0", 8080), Handler).serve_forever()
