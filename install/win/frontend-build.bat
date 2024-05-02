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
echo 
echo ######################
echo #   build frontend   #
echo ######################

set DEBUG_INFO=%~2

pushd %~s1

  call yarn install
  if "%DEBUG_INFO%"=="true" yarn debug-info
  call yarn build
  call yarn deploy

popd
