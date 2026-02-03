@echo off
echo ========================================
echo   Sistema de Gestao para Transportadora
echo   Iniciando Servidores
echo ========================================
echo.

echo Iniciando backend na porta 3000...
start "Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Iniciando frontend na porta 5173...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   Servidores Iniciados!
echo ========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Pressione qualquer tecla para fechar esta janela
echo (Os servidores continuarao rodando)
echo.
pause >nul
