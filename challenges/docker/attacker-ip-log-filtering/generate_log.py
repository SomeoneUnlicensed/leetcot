import random
import sys
from datetime import datetime, timedelta

flag = sys.argv[1]
out_path = sys.argv[2]

paths = ["/", "/catalog", "/product/1042", "/cart", "/checkout", "/api/stock", "/static/logo.png"]
normal_ips = [f"203.0.113.{n}" for n in range(2, 40)]
attacker_ip = "198.51.100.77"

random.seed(42)
start = datetime(2026, 3, 4, 9, 0, 0)
lines = []

for i in range(400):
    ip = random.choice(normal_ips)
    t = start + timedelta(seconds=i * 3)
    path = random.choice(paths)
    status = random.choice([200, 200, 200, 304])
    lines.append(f'{ip} - - [{t.strftime("%d/%b/%Y:%H:%M:%S +0000")}] "GET {path} HTTP/1.1" {status} 512 "-" "Mozilla/5.0"')

scan_paths = ["/wp-login.php", "/.env", "/admin/config.php", "/.git/config", "/phpmyadmin/", "/api/v1/../../etc/passwd"]
scan_start = start + timedelta(seconds=600)
for i, p in enumerate(scan_paths):
    t = scan_start + timedelta(seconds=i)
    lines.append(f'{attacker_ip} - - [{t.strftime("%d/%b/%Y:%H:%M:%S +0000")}] "GET {p} HTTP/1.1" 404 0 "-" "curl/8.4.0"')

final_t = scan_start + timedelta(seconds=len(scan_paths) + 1)
lines.append(
    f'{attacker_ip} - - [{final_t.strftime("%d/%b/%Y:%H:%M:%S +0000")}] '
    f'"GET /debug/whoami?token={flag} HTTP/1.1" 200 128 "-" "curl/8.4.0"'
)

lines.sort(key=lambda l: l.split("[")[1].split("]")[0])
with open(out_path, "w") as f:
    f.write("\n".join(lines) + "\n")
