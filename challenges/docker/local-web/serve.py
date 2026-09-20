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

import functools
from http.server import SimpleHTTPRequestHandler

handler = functools.partial(SimpleHTTPRequestHandler, directory="/srv/shop-site")
FastHTTPServer(("127.0.0.1", 8080), handler).serve_forever()
