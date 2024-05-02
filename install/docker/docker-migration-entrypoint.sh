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

MYSQL_HOST=${MYSQL_HOST:-${MYSQL_CONTAINER_NAME}}
MYSQL_DATABASE=${MYSQL_DATABASE:-"onlyoffice"}
MYSQL_USER=${MYSQL_USER:-"onlyoffice_user"}
MYSQL_PASSWORD=${MYSQL_PASSWORD:-"onlyoffice_pass"}
MIGRATION_TYPE=${MIGRATION_TYPE:-"STANDALONE"}
PARAMETERS="standalone=true"

sed -i "s!\"ConnectionString\".*!\"ConnectionString\": \"Server=${MYSQL_HOST};Database=${MYSQL_DATABASE};User ID=${MYSQL_USER};Password=${MYSQL_PASSWORD}\",!g" ./appsettings.runner.json

if [[ ${MIGRATION_TYPE} == "SAAS" ]]
then
    PARAMETERS=""
fi

dotnet ASC.Migration.Runner.dll ${PARAMETERS}
