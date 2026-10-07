@echo off
REM First run installs npm packages, then starts the React dev server
cd /d "%~dp0frontend"
if not exist node_modules (
  echo Installing npm packages...
  call npm install
)
echo.
echo Open http://localhost:5173 in your browser
call npm run dev
