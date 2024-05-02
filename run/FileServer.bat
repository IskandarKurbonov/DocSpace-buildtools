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

PUSHD %~dp0..\..
set servicepath=%cd%\server\products\ASC.Files\Server\bin\Debug\ASC.Files.exe urls=http://0.0.0.0:5007 $STORAGE_ROOT=%cd%\Data log:dir=%cd%\Logs log:name=files pathToConf=%cd%\buildtools\config core:products:folder=%cd%\server\products