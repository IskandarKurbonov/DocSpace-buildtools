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
set servicepath=%cd%\server\common\services\ASC.ClearEvents\bin\Debug\ASC.ClearEvents.exe urls=http://0.0.0.0:5027 $STORAGE_ROOT=%cd%\Data pathToConf=%cd%\buildtools\config log:dir=%cd%\Logs log:name=clearEvents core:products:folder=%cd%\server\products