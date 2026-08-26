@echo off
cd /d "%~dp0"
title Portfolio - Production
echo Starting production server...
echo Open http://localhost:3000
echo.
if not exist ".next\" (
  echo No build found. Running build.bat first...
  call npm run build
  if errorlevel 1 (
    echo Build failed.
    pause
    exit /b 1
  )
)
call npm run start
pause
