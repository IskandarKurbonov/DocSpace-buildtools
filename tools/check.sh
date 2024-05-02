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

CHANGES=$(/snap/libxml2/current/bin/xmllint --xpath '//changeSet/item/affectedPath/text()' $1);
shift
for i in $CHANGES
do
  for j in $@
  do
   if [[ $i == $j* ]]; then
    echo 1
    exit
   fi
  done
done

echo 0
exit

