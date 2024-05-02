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

set save=false

 if /I "%1" == "-s" set save=%2 & shift
 shift

dotnet test client\common\Tests\Frontend.Translations.Tests\Frontend.Translations.Tests.csproj --filter Name~SpellCheckTest -l:html --environment "BASE_DIR=%dir%" --environment "SAVE=%save%" --results-directory "%dir%/TestsResults"