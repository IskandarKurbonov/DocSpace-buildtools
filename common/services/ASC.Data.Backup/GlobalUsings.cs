﻿global using System;
global using System.Collections.Generic;
global using System.IO;
global using System.Linq;
global using System.Runtime.InteropServices;

global using ASC.Api.Collections;
global using ASC.Api.Core;
global using ASC.Common;
global using ASC.Common.Threading;
global using ASC.Common.Utils;
global using ASC.Core;
global using ASC.Data.Backup;
global using ASC.Data.Backup.ApiModels;
global using ASC.Data.Backup.Contracts;
global using ASC.Data.Backup.Controllers;
global using ASC.Data.Backup.Services;
global using ASC.EventBus.Abstractions;
global using ASC.Web.Api.Routing;
global using ASC.Web.Studio.Core.Notify;
global using ASC.Web.Studio.Utility;

global using Autofac;
global using Autofac.Extensions.DependencyInjection;

global using Microsoft.AspNetCore.Builder;
global using Microsoft.AspNetCore.Hosting;
global using Microsoft.AspNetCore.Mvc;
global using Microsoft.Extensions.Configuration;
global using Microsoft.Extensions.DependencyInjection;
global using Microsoft.Extensions.Hosting;

global using static ASC.Data.Backup.BackupAjaxHandler;
