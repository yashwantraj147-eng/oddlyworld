@echo off
title ODDLYWORLD Desktop Launcher
cd /d "%~dp0"

echo ===================================================
echo     Launching ODDLYWORLD: The Infinite Toybox
echo ===================================================
echo.

:: 1. Launch Vite local server in background if not already responding
curl -s http://localhost:5174/ >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Starting background engine...
  start /B "" npm run dev -- --port 5174
  timeout /t 2 /nobreak >nul
)

:: 2. Launch in dedicated native Desktop App Window Mode (Frameless, no browser URL bar)
set EDGE_PATH="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if exist %EDGE_PATH% (
  start "" %EDGE_PATH% --app=http://localhost:5174/ --window-size=1440,900 --app-auto-launched
) else (
  start http://localhost:5174/
)

exit
