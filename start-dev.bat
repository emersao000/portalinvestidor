@echo off
echo Iniciando Frontend e Backend...
echo.

REM Inicia o Backend em uma nova janela
echo Iniciando Backend na porta 8000...
start cmd /k "cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

REM Aguarda um pouco para o backend iniciar
timeout /t 2 /nobreak

REM Inicia o Frontend em uma nova janela
echo Iniciando Frontend na porta 3020...
start cmd /k "cd frontend && npm run dev"

echo.
echo ✓ Frontend e Backend foram iniciados em janelas separadas
echo.
echo Frontend: http://localhost:3020
echo Backend: http://localhost:8000
echo.
pause
