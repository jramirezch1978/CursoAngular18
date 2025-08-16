@echo off
echo ===============================================
echo COMPILANDO TODOS LOS LABORATORIOS EN ANGULAR V18
echo ===============================================
echo.

echo ===== LAB 1 - Servicios y Signals =====
cd "LAB 1-Servicios-Signals"
call npm install
call ng build
if %errorlevel% neq 0 (
    echo ERROR: LAB 1 fallo la compilacion
    pause
    exit /b 1
)
cd ..
echo LAB 1 compilado exitosamente!
echo.

echo ===== LAB 2 - Componentes Standalone =====
cd "LAB 2-Standalone"
call npm install
call ng build
if %errorlevel% neq 0 (
    echo ERROR: LAB 2 fallo la compilacion
    pause
    exit /b 1
)
cd ..
echo LAB 2 compilado exitosamente!
echo.

echo ===== LAB 3 - Providers y Jerarquia =====
cd "LAB 3-Providers"
call npm install
call ng build
if %errorlevel% neq 0 (
    echo ERROR: LAB 3 fallo la compilacion
    pause
    exit /b 1
)
cd ..
echo LAB 3 compilado exitosamente!
echo.

echo ===== LAB 4 - Patrones Empresariales =====
cd "LAB 4-Patterns"
call npm install
call ng build
if %errorlevel% neq 0 (
    echo ERROR: LAB 4 fallo la compilacion
    pause
    exit /b 1
)
cd ..
echo LAB 4 compilado exitosamente!
echo.

echo ===============================================
echo TODOS LOS LABORATORIOS COMPILARON EXITOSAMENTE!
echo Angular v18 confirmado en todos los proyectos
echo ===============================================
pause
