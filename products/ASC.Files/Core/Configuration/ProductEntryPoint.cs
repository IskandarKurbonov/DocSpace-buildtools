// (c) Copyright Ascensio System SIA 2010-2022
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

namespace ASC.Web.Files.Configuration;

[Scope]
public class ProductEntryPoint : Product
{
    internal const string ProductPath = "/";

    private readonly FilesSpaceUsageStatManager _filesSpaceUsageStatManager;
    private readonly CoreBaseSettings _coreBaseSettings;
    private readonly AuthContext _authContext;
    private readonly UserManager _userManager;
    private readonly NotifyConfiguration _notifyConfiguration;
    private readonly AuditEventsRepository _auditEventsRepository;
    private readonly IDaoFactory _daoFactory;
    private readonly TenantManager _tenantManager;
    private readonly RoomsNotificationSettingsHelper _roomsNotificationSettingsHelper;
    private readonly PathProvider _pathProvider;

    //public SubscriptionManager SubscriptionManager { get; }

    public ProductEntryPoint() { }

    public ProductEntryPoint(
        FilesSpaceUsageStatManager filesSpaceUsageStatManager,
        CoreBaseSettings coreBaseSettings,
        AuthContext authContext,
        UserManager userManager,
        NotifyConfiguration notifyConfiguration,
        AuditEventsRepository auditEventsRepository,
        IDaoFactory daoFactory,
        TenantManager tenantManager,
        RoomsNotificationSettingsHelper roomsNotificationSettingsHelper,
        PathProvider pathProvider
        //            SubscriptionManager subscriptionManager
        )
    {
        _filesSpaceUsageStatManager = filesSpaceUsageStatManager;
        _coreBaseSettings = coreBaseSettings;
        _authContext = authContext;
        _userManager = userManager;
        _notifyConfiguration = notifyConfiguration;
        _auditEventsRepository = auditEventsRepository;
        _daoFactory = daoFactory;
        _tenantManager = tenantManager;
        _roomsNotificationSettingsHelper = roomsNotificationSettingsHelper;
        _pathProvider = pathProvider;
        //SubscriptionManager = subscriptionManager;
    }

    public static readonly Guid ID = WebItemManager.DocumentsProductID;

    private ProductContext _productContext;

    public override bool Visible => true;
    public override bool IsPrimary => true;

    public override void Init()
    {
        List<string> adminOpportunities() => (_coreBaseSettings.CustomMode
                                                           ? CustomModeResource.ProductAdminOpportunitiesCustomMode
                                                           : FilesCommonResource.ProductAdminOpportunities).Split('|').ToList();

        List<string> userOpportunities() => (_coreBaseSettings.CustomMode
                                     ? CustomModeResource.ProductUserOpportunitiesCustomMode
                                     : FilesCommonResource.ProductUserOpportunities).Split('|').ToList();

        _productContext =
            new ProductContext
            {
                DisabledIconFileName = "product_disabled_logo.png",
                IconFileName = "images/files.menu.svg",
                LargeIconFileName = "images/files.svg",
                DefaultSortOrder = 10,
                //SubscriptionManager = SubscriptionManager,
                SpaceUsageStatManager = _filesSpaceUsageStatManager,
                AdminOpportunities = adminOpportunities,
                UserOpportunities = userOpportunities,
                CanNotBeDisabled = true,
            };

        if (_notifyConfiguration != null)
        {
            _notifyConfiguration.Configure();
        }
        //SearchHandlerManager.Registry(new SearchHandler());
    }

    public string GetModuleResource(string ResourceClassTypeName, string ResourseKey)
    {
        if (string.IsNullOrEmpty(ResourseKey))
        {
            return string.Empty;
        }

        try
        {
            return (string)Type.GetType(ResourceClassTypeName).GetProperty(ResourseKey, BindingFlags.Static | BindingFlags.Public).GetValue(null, null);
        }
        catch (Exception)
        {
            return string.Empty;
        }
    }

    public override async Task<IEnumerable<ActivityInfo>> GetAuditEventsAsync(DateTime scheduleDate, Guid userId, Tenant tenant, WhatsNewType whatsNewType)
    {
        IEnumerable<AuditEventDto> events;
        _tenantManager.SetCurrentTenant(tenant);

        if (whatsNewType == WhatsNewType.RoomsActivity)
        {
            events = _auditEventsRepository.GetByFilterWithActions(
                withoutUserId: userId,
                actions: StudioWhatsNewNotify.RoomsActivityActions,
                from: scheduleDate.Date.AddHours(-1),
                   to: scheduleDate.Date.AddSeconds(-1),
                   limit: 100);
        }
        else
        {
            events = _auditEventsRepository.GetByFilterWithActions(
                withoutUserId: userId,
                actions: StudioWhatsNewNotify.DailyActions,
                from: scheduleDate.Date.AddDays(-1),
                to: scheduleDate.Date.AddSeconds(-1),
            limit: 100);
        }

        var disabledRooms = _roomsNotificationSettingsHelper.GetDisabledRoomsForUser(userId);

        var roomIds = new List<string>();
        var result = new List<ActivityInfo>();

        foreach (var e in events)
        {
            RoomInfo roomInfo = null;

            var obj = e.Description[e.Description.Count - 1];
            roomInfo = JsonSerializer.Deserialize<RoomInfo>(obj);

            var roomId = roomInfo.Id;
            var withRoom = true;

            if (roomId > 0 && disabledRooms.Contains(roomId))
            {
                continue;
            }
            else if (roomId > 0)
            {
                if (!roomIds.Contains(roomId.ToString()))
                {
                    roomIds.Add(roomId.ToString());
                }
            }
            else if (roomId < 0)
            {
                withRoom = false;
            }

            result.Add(new ActivityInfo
            {
                UserId = e.UserId,
                Action = (MessageAction)e.Action,
                Data = e.Date,
                Page = e.Page,
                FileTitle = e.Description[0],
                RoomUri = withRoom ? _pathProvider.GetRoomsUrl(roomId.ToString()) : default,
                RoomId = withRoom ? roomInfo?.Id.ToString() : default,
                RoomTitle = withRoom ? roomInfo?.Title : default,
                RoomOldTitle = withRoom ? roomInfo?.OldTitle : default
            });
        }

        var roomsShareInfo = new List<FileShareRecord>();

        if (roomIds.Count() > 0)
        {
            var folderDao = _daoFactory.GetSecurityDao<int>();
            roomsShareInfo = await folderDao.GetShareForEntryIdsAsync(userId, roomIds).ToListAsync();
        }

        foreach (var activity in result)
        {
            var record = roomsShareInfo.Where(r => r.EntryId.ToString() == activity.RoomId).FirstOrDefault();

            activity.IsAdmin = userId == record?.Owner || record?.Share == FileShare.RoomAdmin;
            activity.IsMemder = activity.UserId == record?.Subject && record?.Share > FileShare.None;
        }

        return result;
    }

    public override Guid ProductID => ID;
    public override string Name => FilesCommonResource.ProductName;

    public override string Description
    {
        get
        {
            var id = _authContext.CurrentAccount.ID;

            if (_userManager.IsUserInGroup(id, Constants.GroupUser.ID))
            {
                return FilesCommonResource.ProductDescriptionShort;
            }

            if (_userManager.IsUserInGroup(id, Constants.GroupAdmin.ID) || _userManager.IsUserInGroup(id, ID))
            {
                return FilesCommonResource.ProductDescriptionEx;
            }

            return FilesCommonResource.ProductDescription;
        }
    }

    public override string StartURL => ProductPath;
    public override string HelpURL => PathProvider.StartURL;
    public override string ProductClassName => "files";
    public override ProductContext Context => _productContext;
    public override string ApiURL => string.Empty;
}
