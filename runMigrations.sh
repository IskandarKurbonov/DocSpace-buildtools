#!/bin/bash

#  SPDX-FileCopyrightText: 2024 Ascensio System SIA
#
#  SPDX-License-Identifier: Ascensio-System
#
#     Our License onlyoffice.com
#     Empty line
#     Empty line
#     Empty line
#     Empty line
#     Empty line
#     Empty line
#     Empty line
#     

echo "MIGRATIONS"
echo off

rd="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
echo "Run script directory:" $rd

dir=$(builtin cd $rd/../; pwd)
echo "Root directory:" $dir

dotnet build $dir/asc.web.slnf
dotnet build $dir/ASC.Migrations.sln

pushd $dir/common/Tools/ASC.Migration.Runner/bin/Debug/net6.0
dotnet ASC.Migration.Runner.dll