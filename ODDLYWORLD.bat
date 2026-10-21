@echo off
title ODDLYWORLD: The Infinite Toybox
echo ===================================================
echo   Launching ODDLYWORLD: The Infinite Toybox
echo ===================================================
echo.
cd /d "%~dp0"
call npx electron electron/main.cjs
