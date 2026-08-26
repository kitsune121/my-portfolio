@echo off
cd /d "%~dp0"
title Portfolio - Dev Server
echo Starting development server...
echo Open http://localhost:3000
echo Admin: http://localhost:3000/admin
echo.
if not exist "node_modules\" (
  echo node_modules missing — running npm install first...
  call npm install
  if errorlevel 1 (
    echo Install failed.
    pause
    exit /b 1
  )
)
call npm run dev
pause
