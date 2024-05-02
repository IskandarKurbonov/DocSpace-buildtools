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

PUSHD %~dp0\..
set dir="%cd%"
echo %dir%
dotnet test %dir%\client\common\Tests\Frontend.Translations.Tests\Frontend.Translations.Tests.csproj --filter "TestCategory=Locales" -l:html --environment "BASE_DIR=%dir%" --results-directory "%dir%\TestsResults"