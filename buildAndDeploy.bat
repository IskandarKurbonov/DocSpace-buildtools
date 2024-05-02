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

cd /D "%~dp0"
call runasadmin.bat "%~dpnx0"

if %errorlevel% == 0 (


echo "FRONT-END static"
call build.static.bat nopause

echo "BACK-END"
call build.backend.bat nopause

echo.

pause

)
