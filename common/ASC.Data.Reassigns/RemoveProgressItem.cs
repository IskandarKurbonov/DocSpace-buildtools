/*
 *
 * (c) Copyright Ascensio System Limited 2010-2018
 *
 * This program is freeware. You can redistribute it and/or modify it under the terms of the GNU 
 * General Public License (GPL) version 3 as published by the Free Software Foundation (https://www.gnu.org/copyleft/gpl.html). 
 * In accordance with Section 7(a) of the GNU GPL its Section 15 shall be amended to the effect that 
 * Ascensio System SIA expressly excludes the warranty of non-infringement of any third-party rights.
 *
 * THIS PROGRAM IS DISTRIBUTED WITHOUT ANY WARRANTY; WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR
 * FITNESS FOR A PARTICULAR PURPOSE. For more details, see GNU GPL at https://www.gnu.org/copyleft/gpl.html
 *
 * You can contact Ascensio System SIA by email at sales@onlyoffice.com
 *
 * The interactive user interfaces in modified source and object code versions of ONLYOFFICE must display 
 * Appropriate Legal Notices, as required under Section 5 of the GNU GPL version 3.
 *
 * Pursuant to Section 7 § 3(b) of the GNU GPL you must retain the original ONLYOFFICE logo which contains 
 * relevant author attributions when distributing the software. If the display of the logo in its graphic 
 * form is not reasonably feasible for technical reasons, you must include the words "Powered by ONLYOFFICE" 
 * in every copy of the program you distribute. 
 * Pursuant to Section 7 § 3(e) we decline to grant you any rights under trademark law for use of our trademarks.
 *
*/


using System;
using System.Collections.Generic;
using System.Globalization;
using System.Security.Cryptography;
using System.Text;

using ASC.Common;
using ASC.Common.Logging;
using ASC.Common.Threading.Progress;
using ASC.Core;
using ASC.Core.Users;
using ASC.Data.Storage;
//using ASC.Mail.Core.Engine;
using ASC.MessagingSystem;
//using ASC.Web.CRM.Core;
using ASC.Web.Core;
//using ASC.Web.Files.Services.WCFService;
using ASC.Web.Studio.Core.Notify;
//using CrmDaoFactory = ASC.CRM.Core.Dao.DaoFactory;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Primitives;

namespace ASC.Data.Reassigns
{
    public class RemoveProgressItem : IProgressItem
    {
        private readonly IDictionary<string, StringValues> _httpHeaders;

        private readonly int _tenantId;
        private readonly Guid _currentUserId;
        private readonly bool _notify;

        //private readonly IFileStorageService _docService;
        //private readonly MailGarbageEngine _mailEraser;

        public object Id { get; set; }
        public object Status { get; set; }
        public object Error { get; set; }
        public double Percentage { get; set; }
        public bool IsCompleted { get; set; }
        public Guid FromUser { get; }
        private IServiceProvider ServiceProvider { get; }
        public UserInfo User { get; }

        public RemoveProgressItem(
            IServiceProvider serviceProvider,
            HttpContext context,
            QueueWorkerRemove queueWorkerRemove,
            int tenantId, UserInfo user, Guid currentUserId, bool notify)
        {
            _httpHeaders = QueueWorker.GetHttpHeaders(context.Request);
            ServiceProvider = serviceProvider;
            _tenantId = tenantId;
            User = user;
            FromUser = user.ID;
            _currentUserId = currentUserId;
            _notify = notify;

            //_docService = Web.Files.Classes.Global.FileStorageService;
            //_mailEraser = new MailGarbageEngine();

            Id = queueWorkerRemove.GetProgressItemId(tenantId, FromUser);
            Status = ProgressStatus.Queued;
            Error = null;
            Percentage = 0;
            IsCompleted = false;
        }

        public void RunJob()
        {
            using var scope = ServiceProvider.CreateScope();   
            var scopeClass = scope.ServiceProvider.GetService<Scope>();
            var logger = scopeClass.Options.Get("ASC.Web");
            var tenant = scopeClass.TenantManager.SetCurrentTenant(_tenantId);
            var userName = scopeClass.UserFormatter.GetUserName(User, DisplayUserNameFormat.Default);

            try
            {
                Percentage = 0;
                Status = ProgressStatus.Started;

                scopeClass.SecurityContext.AuthenticateMe(_currentUserId);

                long crmSpace;
                GetUsageSpace(scopeClass.WebItemManagerSecurity, out var docsSpace, out var mailSpace, out var talkSpace);

                logger.InfoFormat("deleting user data for {0} ", FromUser);

                logger.Info("deleting of data from documents");

                Percentage = 25;
                //_docService.DeleteStorage(_userId);

                if (!scopeClass.CoreBaseSettings.CustomMode)
                {
                    logger.Info("deleting of data from crm");

                    Percentage = 50;
                    //using (var scope = DIHelper.Resolve(_tenantId))
                    //{
                    //    var crmDaoFactory = scope.Resolve<CrmDaoFactory>();
                    crmSpace = 0;// crmDaoFactory.ReportDao.GetFiles(_userId).Sum(file => file.ContentLength);
                    //    crmDaoFactory.ReportDao.DeleteFiles(_userId);
                    //}
                }
                else
                {
                    crmSpace = 0;
                }

                logger.Info("deleting of data from mail");

                Percentage = 75;
                //_mailEraser.ClearUserMail(_userId);

                logger.Info("deleting of data from talk");

                Percentage = 99;
                DeleteTalkStorage(scopeClass.StorageFactory);

                SendSuccessNotify(scopeClass.StudioNotifyService, scopeClass.MessageService, scopeClass.MessageTarget, userName, docsSpace, crmSpace, mailSpace, talkSpace);

                Percentage = 100;
                Status = ProgressStatus.Done;
            }
            catch (Exception ex)
            {
                logger.Error(ex);
                Status = ProgressStatus.Failed;
                Error = ex.Message;
                SendErrorNotify(scopeClass.StudioNotifyService, ex.Message, userName);
            }
            finally
            {
                logger.Info("data deletion is complete");
                IsCompleted = true;
            }
        }

        public object Clone()
        {
            return MemberwiseClone();
        }

        private void GetUsageSpace(WebItemManagerSecurity webItemManagerSecurity, out long docsSpace, out long mailSpace, out long talkSpace)
        {
            docsSpace = mailSpace = talkSpace = 0;

            var webItems = webItemManagerSecurity.GetItems(Web.Core.WebZones.WebZoneType.All, ItemAvailableState.All);

            foreach (var item in webItems)
            {
                IUserSpaceUsage manager;

                if (item.ID == WebItemManager.DocumentsProductID)
                {
                    manager = item.Context.SpaceUsageStatManager as IUserSpaceUsage;
                    if (manager == null) continue;
                    docsSpace = manager.GetUserSpaceUsage(FromUser);
                }

                if (item.ID == WebItemManager.MailProductID)
                {
                    manager = item.Context.SpaceUsageStatManager as IUserSpaceUsage;
                    if (manager == null) continue;
                    mailSpace = manager.GetUserSpaceUsage(FromUser);
                }

                if (item.ID == WebItemManager.TalkProductID)
                {
                    manager = item.Context.SpaceUsageStatManager as IUserSpaceUsage;
                    if (manager == null) continue;
                    talkSpace = manager.GetUserSpaceUsage(FromUser);
                }
            }
        }

        private void DeleteTalkStorage(StorageFactory storageFactory)
        {
            using var md5 = MD5.Create();
            var data = md5.ComputeHash(Encoding.Default.GetBytes(FromUser.ToString()));

            var sBuilder = new StringBuilder();

            for (int i = 0, n = data.Length; i < n; i++)
            {
                sBuilder.Append(data[i].ToString("x2"));
            }

            var md5Hash = sBuilder.ToString();

            var storage = storageFactory.GetStorage(_tenantId.ToString(CultureInfo.InvariantCulture), "talk");

            if (storage != null && storage.IsDirectory(md5Hash))
            {
                storage.DeleteDirectory(md5Hash);
            }
        }

        private void SendSuccessNotify(StudioNotifyService studioNotifyService, MessageService messageService, MessageTarget messageTarget, string userName, long docsSpace, long crmSpace, long mailSpace, long talkSpace)
        {
            if (_notify)
                studioNotifyService.SendMsgRemoveUserDataCompleted(_currentUserId, User, userName,
                                                                            docsSpace, crmSpace, mailSpace, talkSpace);

            if (_httpHeaders != null)
                messageService.Send(_httpHeaders, MessageAction.UserDataRemoving, messageTarget.Create(FromUser), new[] { userName });
            else
                messageService.Send(MessageAction.UserDataRemoving, messageTarget.Create(FromUser), userName);
        }

        private void SendErrorNotify(StudioNotifyService studioNotifyService, string errorMessage, string userName)
        {
            if (!_notify) return;

            studioNotifyService.SendMsgRemoveUserDataFailed(_currentUserId, User, userName, errorMessage);
        }

        class Scope
        {
            internal TenantManager TenantManager { get; }
            internal CoreBaseSettings CoreBaseSettings { get; }
            internal MessageService MessageService { get; }
            internal StudioNotifyService StudioNotifyService { get; }
            internal SecurityContext SecurityContext { get; }
            internal UserManager UserManager { get; }
            internal MessageTarget MessageTarget { get; }
            internal WebItemManagerSecurity WebItemManagerSecurity { get; }
            internal StorageFactory StorageFactory { get; }
            internal UserFormatter UserFormatter { get; }
            internal IOptionsMonitor<ILog> Options { get; }

            public Scope(TenantManager tenantManager,
                CoreBaseSettings coreBaseSettings,
                MessageService messageService,
                StudioNotifyService studioNotifyService,
                SecurityContext securityContext,
                UserManager userManager,
                MessageTarget messageTarget,
                WebItemManagerSecurity webItemManagerSecurity,
                StorageFactory storageFactory,
                UserFormatter userFormatter,
                IOptionsMonitor<ILog> options)
            {
                TenantManager = tenantManager;
                CoreBaseSettings = coreBaseSettings;
                MessageService = messageService;
                StudioNotifyService = studioNotifyService;
                SecurityContext = securityContext;
                UserManager = userManager;
                MessageTarget = messageTarget;
                WebItemManagerSecurity = webItemManagerSecurity;
                StorageFactory = storageFactory;
                UserFormatter = userFormatter;
                Options = options;
            }
        }
    }

    public static class RemoveProgressItemExtension
    {
        public static DIHelper AddRemoveProgressItemService(this DIHelper services)
        {

            services.TryAddSingleton<ProgressQueueOptionsManager<RemoveProgressItem>>();
            services.TryAddSingleton<ProgressQueue<RemoveProgressItem>>();
            services.AddSingleton<IPostConfigureOptions<ProgressQueue<RemoveProgressItem>>, ConfigureProgressQueue<RemoveProgressItem>>();
            return services;
        }
    }
}
