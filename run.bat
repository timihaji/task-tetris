@echo off
:: Kill any existing server on port 8080
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080 "') do taskkill /PID %%a /F >nul 2>&1

cd /d "%~dp0"
echo Starting Task Tetris at http://localhost:8080
start "" cmd /c "python -m http.server 8080"
timeout /t 2 /nobreak >nul
start "" "http://localhost:8080/Task Tetris.html"
