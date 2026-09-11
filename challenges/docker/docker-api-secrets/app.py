import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer

FLAG = os.environ.get("FLAG", "MISSING_FLAG")
CONTAINER_ID = "a1b2c3d4e5f6"

LIST_RESPONSE = [
    {
        "Id": CONTAINER_ID,
        "Names": ["/payment-worker"],
        "Image": "internal/payment-worker:2.3.1",
        "State": "running",
        "Status": "Up 6 days",
    },
    {
        "Id": "9f8e7d6c5b4a",
        "Names": ["/nginx-edge"],
        "Image": "nginx:1.25",
        "State": "running",
        "Status": "Up 6 days",
    },
]

def inspect_response():
    return {
        "Id": CONTAINER_ID,
        "Name": "/payment-worker",
        "Config": {
            "Image": "internal/payment-worker:2.3.1",
            "Env": [
                "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin",
                "PAYMENT_PROVIDER=internal-gateway",
                f"DEBUG_TOKEN={FLAG}",
            ],
        },
        "State": {"Status": "running", "Running": True},
    }

class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass

    def do_GET(self):
        if self.path in ("/containers/json", "/v1.44/containers/json"):
            self.respond(200, json.dumps(LIST_RESPONSE).encode())
            return
        if self.path.startswith(f"/containers/{CONTAINER_ID}/json") or self.path.startswith(
            f"/v1.44/containers/{CONTAINER_ID}/json"
        ):
            self.respond(200, json.dumps(inspect_response()).encode())
            return
        self.respond(404, b'{"message":"no such container"}')

    def respond(self, code, body):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

if __name__ == "__main__":
    HTTPServer(("0.0.0.0", 2375), Handler).serve_forever()
