import http.server
import socketserver
import threading
import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

SERVICES = [
    # SIGI Distribución is run via Vite dev server on port 3001: (npm run dev)
    {"name": "SCTIS v2.0", "port": 3002, "dir": "apps/sctis-v-2.0-distribucion"},
    {"name": "Gestor Tareas y Minutas", "port": 3003, "dir": "apps/corpoelec---gestor-de-tareas-y-minutas/dist"},
    {"name": "Planificación Eléctrica SEN", "port": 3004, "dir": "apps/planificación-eléctrica-sen/dist"},
    {"name": "Remix SCEIN", "port": 3005, "dir": "apps/remix-scein---seguimiento-y-control-de-equipos-indisponibles-corpoelec/dist"},
    {"name": "SCGCC Correspondencia Corporativa", "port": 3006, "dir": "apps-refactorizadas/SCGCC-REF/dist"},
]

class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

def serve_directory(name, port, rel_path):
    abs_path = os.path.join(BASE_DIR, rel_path)
    if not os.path.exists(abs_path):
        print(f"[{name}] WARNING: Directory {abs_path} does not exist.")
        return
    
    handler = lambda *args, **kwargs: http.server.SimpleHTTPRequestHandler(*args, directory=abs_path, **kwargs)
    try:
        with ReusableTCPServer(("", port), handler) as httpd:
            print(f"[{name}] Serving on http://localhost:{port} from {rel_path}")
            httpd.serve_forever()
    except Exception as e:
        print(f"[{name}] Error starting on port {port}: {e}", file=sys.stderr)

if __name__ == "__main__":
    threads = []
    for s in SERVICES:
        t = threading.Thread(target=serve_directory, args=(s["name"], s["port"], s["dir"]), daemon=True)
        t.start()
        threads.append(t)
    
    print("All microservices started successfully.")
    try:
        for t in threads:
            t.join()
    except KeyboardInterrupt:
        print("\nShutting down servers.")
