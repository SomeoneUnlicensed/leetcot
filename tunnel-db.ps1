# Safe SSH Tunnel for pgAdmin and Database
Clear-Host
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "🐾  ЛитКот: Безопасное SSH-подключение к базе данных 🐾" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "🔗  Ссылки для входа:"
Write-Host "    pgAdmin (Редактор БД):   http://localhost:5050" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔑  Данные для входа в pgAdmin:"
Write-Host "    Email:     admin@leetcot.ru"
Write-Host "    Пароль:    LitKotPgAdmin982!#" -ForegroundColor Yellow
Write-Host ""
Write-Host "🐘  Данные для подключения к PostgreSQL (внутри pgAdmin):"
Write-Host "    Пароль БД: zX8vN2mK9pQ1!rT" -ForegroundColor Yellow
Write-Host ""
Write-Host "----------------------------------------------------------"
Write-Host "👉  Сервер баз данных автоматически предзагружен в pgAdmin."
Write-Host "👉  Для закрытия туннеля нажмите Ctrl+C или просто закройте это окно."
Write-Host "----------------------------------------------------------"
Write-Host "Запуск SSH-туннеля..." -ForegroundColor Gray

ssh -N -L 5050:127.0.0.1:5050 cld3
