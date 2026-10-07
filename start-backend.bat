@echo off
REM First run: creates a virtual environment, installs packages and copies .env.example to .env
cd /d "%~dp0backend"
if not exist .venv (
  echo Creating virtual environment...
  python -m venv .venv
  call .venv\Scripts\activate
  pip install -r requirements.txt
) else (
  call .venv\Scripts\activate
)
if not exist .env copy .env.example .env
echo.
echo Backend running at http://127.0.0.1:8000  (API docs: http://127.0.0.1:8000/docs)
uvicorn app.main:app --reload --port 8000
