@echo off
setlocal

REM AutoLeave AI one-click runner
REM Starts backend API and frontend static server in separate terminals.

set "ROOT=%~dp0"
set "BACKEND_DIR=%ROOT%backend"
set "FRONTEND_DIR=%ROOT%frontend"
set "BACKEND_PORT=5000"
set "FRONTEND_PORT=5500"

echo.
echo ==========================================
echo   AutoLeave AI - Starting full stack
echo ==========================================
echo.

if not exist "%BACKEND_DIR%\package.json" (
  echo [ERROR] backend\package.json not found.
  pause
  exit /b 1
)

if not exist "%FRONTEND_DIR%\index.html" (
  echo [ERROR] frontend\index.html not found.
  pause
  exit /b 1
)

echo [0/2] Cleaning old processes on required ports ...
call :kill_port "%BACKEND_PORT%" "backend"
call :kill_port "%FRONTEND_PORT%" "frontend"

echo [1/2] Starting backend on http://localhost:%BACKEND_PORT% ...
start "AutoLeave Backend" cmd /k "cd /d "%BACKEND_DIR%" && npm start"

echo [2/2] Starting frontend on http://localhost:%FRONTEND_PORT% ...
start "AutoLeave Frontend" cmd /k "cd /d "%FRONTEND_DIR%" && python -m http.server %FRONTEND_PORT%"

timeout /t 2 /nobreak >nul
start "" "http://localhost:%FRONTEND_PORT%"

echo.
echo Done. Two terminals were launched:
echo - Backend:  http://localhost:%BACKEND_PORT%
echo - Frontend: http://localhost:%FRONTEND_PORT%
echo.
echo To stop: close both terminal windows.
echo.

endlocal
exit /b 0

:kill_port
setlocal
set "PORT=%~1"
set "LABEL=%~2"
set "FOUND=0"

for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%PORT% .*LISTENING"') do (
  set "FOUND=1"
  echo    - Killing %LABEL% process on port %PORT% (PID %%P)
  taskkill /PID %%P /F >nul 2>&1
)

if "%FOUND%"=="0" (
  echo    - No running process found on port %PORT%
)

endlocal
exit /b 0

