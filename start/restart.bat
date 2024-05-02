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

PUSHD %~dp0..
call runasadmin.bat "%~dpnx0"

POPD

if %errorlevel% == 0 (
	pwsh  %~dp0/command.ps1 "restart"
)

echo.

if "%1"=="nopause" goto start
pause
:start