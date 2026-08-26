@echo off
cd /d "%~dp0"
title Portfolio - Build
echo Building production app...
if not exist "node_modules\" (
  echo node_modules missing — running npm install first...
  call npm install
  if errorlevel 1 (
    echo Install failed.
    pause
    exit /b 1
  )
)
call npm run build
if errorlevel 1 (
  echo.
  echo Build failed.
  pause
  exit /b 1
)
echo.
echo Build OK. Next: double-click start-production.bat
pause
