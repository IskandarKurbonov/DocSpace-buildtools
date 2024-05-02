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

if %errorlevel% == 0 (
	for /R "run\" %%f in (*.bat) do (
                echo Running service stop and delete "Onlyoffice%%~nf" 
		call sc stop "Onlyoffice%%~nf"
		call sc delete "Onlyoffice%%~nf"
	)
	for /R "run\" %%f in (*.xml) do (
		call install\win\WinSW3.0.0.exe stop %%f
		call install\win\WinSW3.0.0.exe uninstall %%f
	)
)

echo.
pause