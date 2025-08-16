@echo off
echo ===============================================
echo VERIFICACION DE ANGULAR V18 EN LABORATORIOS
echo ===============================================
echo.

echo LAB 1 - Servicios y Signals:
cd "LAB 1-Servicios-Signals"
echo Verificando version...
findstr "@angular/core" package.json | findstr "18"
cd ..
echo.

echo LAB 2 - Componentes Standalone:
cd "LAB 2-Standalone"
echo Verificando version...
findstr "@angular/core" package.json | findstr "18"
cd ..
echo.

echo LAB 3 - Providers y Jerarquia:
cd "LAB 3-Providers"
echo Verificando version...
findstr "@angular/core" package.json | findstr "18"
cd ..
echo.

echo LAB 4 - Patrones Empresariales:
cd "LAB 4-Patterns"
echo Verificando version...
findstr "@angular/core" package.json | findstr "18"
cd ..
echo.

echo ===============================================
echo VERIFICACION COMPLETADA
echo Todos los laboratorios deben mostrar version 18.x.x
echo ===============================================
pause
