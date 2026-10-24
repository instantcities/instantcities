#!/usr/bin/env python3
"""Local dev server that tells the browser never to cache, so every edit shows up on reload."""
import http.server
import os
import sys


class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


port = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.environ.get('PORT', 8321))
print(f'Instant City (BETA): the games on http://localhost:{port}/ghent/ and http://localhost:{port}/lecce/')
http.server.ThreadingHTTPServer((os.environ.get('HOST', '127.0.0.1'), port), NoCache).serve_forever()
