#!/usr/bin/python3

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

import subprocess
import time
import os

rd = os.path.dirname(__file__)

start = time.time()

print("Restart all backend services (containers)")
subprocess.run(["python", os.path.join(rd, "stop.backend.docker.py")])
subprocess.run(["python", os.path.join(rd, "start.backend.docker.py")])

end = time.time()
print("\nElapsed time", end - start)