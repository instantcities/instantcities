#!/usr/bin/env python3
"""Local dev server that tells the browser never to cache, so every edit shows up on reload."""
import http.server
import json
import os
import re
import sys
import urllib.parse


class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    # A picture from a quality tour (the game with ?shots=, see .claude/skills/quality-tour): kept in
    # tools/cache/tourshots/<city>/, its number, where the camera was and what it looked at in shots.jsonl.
    def do_POST(self):
        url = urllib.parse.urlparse(self.path)
        q = urllib.parse.parse_qs(url.query)
        if url.path != '/__tourshot' or not re.fullmatch(r'[a-z]+', q.get('city', [''])[0]):
            return self.send_error(404)
        meta = json.loads(q['meta'][0])
        folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tools', 'cache', 'tourshots', q['city'][0])
        os.makedirs(folder, exist_ok=True)
        if meta['i'] == 0:  # a new round: the last one's pictures go
            for f in os.listdir(folder):
                os.remove(os.path.join(folder, f))
        meta['file'] = f"{int(meta['i']):03d}.jpg"
        with open(os.path.join(folder, meta['file']), 'wb') as f:
            f.write(self.rfile.read(int(self.headers['Content-Length'])))
        with open(os.path.join(folder, 'shots.jsonl'), 'a') as f:
            f.write(json.dumps(meta) + '\n')
        self.send_response(204)
        self.end_headers()


port = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.environ.get('PORT', 8321))
print(f'Instant Cities (BETA): the games on http://localhost:{port}/ghent/play/ and http://localhost:{port}/lecce/play/')
http.server.ThreadingHTTPServer((os.environ.get('HOST', '127.0.0.1'), port), NoCache).serve_forever()
