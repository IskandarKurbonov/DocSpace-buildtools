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

set -e

cat<<EOF

#######################################
#  BOOTSTRAP
#######################################

EOF

if ! rpm -q net-tools; then
	${package_manager} -y install net-tools;
fi
