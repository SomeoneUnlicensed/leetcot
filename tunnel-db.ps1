# Safe SSH Tunnel for pgAdmin and Database
Clear-Host
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  LitKot: SSH-tunel k baze dannykh" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  pgAdmin URL:  http://localhost:5050" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Login pgAdmin:"
Write-Host "    Email:      admin@leetcot.ru"
Write-Host "    Password:   LitKotPgAdmin982!#" -ForegroundColor Yellow
Write-Host ""
Write-Host "  PostgreSQL (inside pgAdmin):"
Write-Host "    DB Password: LeetCotDB2026" -ForegroundColor Yellow
Write-Host ""
Write-Host "----------------------------------------------------------"
Write-Host "  DB server is pre-loaded in pgAdmin."
Write-Host "  To close tunnel: Ctrl+C or close this window."
Write-Host "----------------------------------------------------------"
Write-Host "Starting SSH tunnel..." -ForegroundColor Gray

ssh -N -L 5050:127.0.0.1:5050 cld3
