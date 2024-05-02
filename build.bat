REM  SPDX-FileCopyrightText: 2024 Ascensio System SIA
REM
REM  SPDX-License-Identifier: Ascensio-System
REM
REM     Our License onlyoffice.com
REM     Empty line
REM     Empty line
REM     Empty line
REM     Empty line
REM     Empty line
REM     Empty line
REM     Empty line
REM     

@echo off

echo "##########################################################"
echo "#########  Start build and deploy  #######################"
echo "##########################################################"

echo.

PUSHD %~dp0
call runasadmin.bat "%~dpnx0"

if %errorlevel% == 0 (

call start\stop.bat nopause

echo "FRONT-END (for start run command 'yarn start' inside the root folder)"
call build.frontend.bat nopause

echo "BACK-END"
call build.backend.bat nopause

call start\start.bat nopause

echo.

pause
)