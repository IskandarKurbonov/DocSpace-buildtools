@echo off
PUSHD %~dp0
setlocal EnableDelayedExpansion

call runasadmin.bat "%~dpnx0"

if %errorlevel% == 0 (

call start\stop.bat

PUSHD %~dp0..

echo "FRONT-END static"
call build\build.static.bat

echo "BACK-END"
call build\build.backend.bat

call build\start\start.bat

pause
)