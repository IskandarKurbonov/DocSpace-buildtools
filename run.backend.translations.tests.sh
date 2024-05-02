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

rd="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
echo "Run script directory:" $dir

dir=$(builtin cd $rd/../; pwd)

echo "Root directory:" $dir

dotnet test $dir/common/Tests/Backend.Translations.Tests/Backend.Translations.Tests.csproj -l:html --results-directory "$dir/TestsResults" --environment "BASE_DIR=$dir"