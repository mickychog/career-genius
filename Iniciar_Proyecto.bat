@echo off
TITLE CareerGenius Launcher
CLS
ECHO =================================================
ECHO      INICIANDO CAREER GENIUS - PLATAFORMA IA
ECHO =================================================
ECHO.
ECHO [1/4] Verificando Docker...

docker info >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    ECHO [ERROR] Docker no se esta ejecutando. 
    ECHO Por favor inicia Docker Desktop y vuelve a intentarlo.
    PAUSE
    EXIT
)

ECHO [OK] Docker detectado.
ECHO.
ECHO [2/4] Levantando servicios (Backend + Frontend + BD)...
ECHO Esto puede tardar unos minutos la primera vez...

cd 01_Codigo_Fuente
docker-compose up -d

IF %ERRORLEVEL% NEQ 0 (
    ECHO [ERROR] Fallo al levantar docker-compose.
    PAUSE
    EXIT
)

ECHO.
ECHO [3/4] Esperando a que los servicios esten listos...
TIMEOUT /T 15 /NOBREAK

ECHO.
ECHO [4/4] Abriendo la aplicacion en tu navegador...
START http://localhost:3001

ECHO.
ECHO =================================================
ECHO      PROYECTO CORRIENDO EXITOSAMENTE
ECHO      Backend: http://localhost:3000/api-docs
ECHO      Frontend: http://localhost:3001
ECHO =================================================
ECHO.
ECHO Para detener el proyecto, puedes cerrar esta ventana o ejecutar 'docker-compose down'.
PAUSE