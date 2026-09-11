import os
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

WEBROOT = "/srv/webroot"

class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/":
            self.respond(200, "text/html", b"<h1>\xd0\x9f\xd0\xbe\xd1\x80\xd1\x82\xd0\xb0\xd0\xbb \xd0\xbc\xd0\xbe\xd0\xbd\xd0\xb8\xd1\x82\xd0\xbe\xd1\x80\xd0\xb8\xd0\xbd\xd0\xb3\xd0\xb0</h1><p>/view?file=report.txt</p>")
            return
        if parsed.path == "/view":
            qs = parse_qs(parsed.query)
            filename = qs.get("file", [""])[0]
            if not filename:
                self.respond(400, "text/plain", b"Missing ?file=")
                return
            # Vulnerable: naive concatenation, no normalization/containment check.
            target = os.path.join(WEBROOT, filename)
            try:
                with open(target, "rb") as f:
                    self.respond(200, "text/plain", f.read())
            except OSError:
                self.respond(404, "text/plain", b"Not found")
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
