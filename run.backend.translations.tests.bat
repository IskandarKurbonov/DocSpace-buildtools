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

PUSHD %~dp0..
set dir=%~dp0..
echo %dir%
dotnet test server\common\Tests\Backend.Translations.Tests\Backend.Translations.Tests.csproj -l:html --environment "BASE_DIR=%dir%" --results-directory "%dir%/TestsResults"