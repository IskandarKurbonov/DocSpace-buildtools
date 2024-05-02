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

@echo "MIGRATIONS"
@echo off

cd /D "%~dp0"
call start\stop.bat nopause
dotnet build ..\server\asc.web.slnf
dotnet build ..\server\ASC.Migrations.sln
PUSHD %~dp0..\server\common\Tools\ASC.Migration.Runner\bin\Debug\net7.0
dotnet ASC.Migration.Runner.dll standalone=true
pause