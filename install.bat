@echo off
cd /d "%~dp0"
echo Installing dependencies...
call npm install
if errorlevel 1 (
  echo.
  echo Install failed. Make sure Node.js is installed: https://nodejs.org
  pause
  exit /b 1
)
echo.
echo Done. Next: double-click run.bat
pause
