@echo off
echo ========================================
echo   Sistema de Gestao para Transportadora
echo   Script de Instalacao Automatica
echo ========================================
echo.

echo [1/6] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado! Instale em https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js encontrado

echo.
echo [2/6] Instalando dependencias do backend...
cd backend
call npm install
if errorlevel 1 (
    echo ERRO: Falha ao instalar dependencias do backend
    pause
    exit /b 1
)
echo ✓ Dependencias do backend instaladas

echo.
echo [3/6] Gerando cliente Prisma...
call npx prisma generate
if errorlevel 1 (
    echo ERRO: Falha ao gerar cliente Prisma
    pause
    exit /b 1
)
echo ✓ Cliente Prisma gerado

echo.
echo [4/6] Instalando dependencias do frontend...
cd ..\frontend
call npm install
if errorlevel 1 (
    echo ERRO: Falha ao instalar dependencias do frontend
    pause
    exit /b 1
)
echo ✓ Dependencias do frontend instaladas

cd ..

echo.
echo ========================================
echo   Instalacao Concluida com Sucesso!
echo ========================================
echo.
echo Proximos passos:
echo.
echo 1. Configure o PostgreSQL:
echo    - Crie o banco: CREATE DATABASE transportadora;
echo.
echo 2. Configure o arquivo backend\.env com suas credenciais
echo.
echo 3. Execute as migrations:
echo    cd backend
echo    npx prisma migrate dev
echo.
echo 4. Para iniciar o sistema:
echo    - Backend:  cd backend  ^&  npm run dev
echo    - Frontend: cd frontend ^&  npm run dev
echo.
echo Documentacao completa em INSTALACAO.md
echo.
pause
