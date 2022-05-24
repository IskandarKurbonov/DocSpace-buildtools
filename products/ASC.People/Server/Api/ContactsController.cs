﻿// (c) Copyright Ascensio System SIA 2010-2022
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

namespace ASC.People.Api;

public class ContactsController : PeopleControllerBase
{
    private readonly EmployeeFullDtoHelper _employeeFullDtoHelper;

    public ContactsController(
        UserManager userManager,
        PermissionContext permissionContext,
        ApiContext apiContext,
        UserPhotoManager userPhotoManager,
        IHttpClientFactory httpClientFactory,
        EmployeeFullDtoHelper employeeFullDtoHelper,
        IHttpContextAccessor httpContextAccessor)
        : base(userManager, permissionContext, apiContext, userPhotoManager, httpClientFactory, httpContextAccessor)
    {
        _employeeFullDtoHelper = employeeFullDtoHelper;
    }

    [Delete("{userid}/contacts")]
    public EmployeeFullDto DeleteMemberContactsFromBody(string userid, [FromBody] UpdateMemberRequestDto inDto)
    {
        return DeleteMemberContacts(userid, inDto);
    }

    [Delete("{userid}/contacts")]
    [Consumes("application/x-www-form-urlencoded")]
    public EmployeeFullDto DeleteMemberContactsFromForm(string userid, [FromForm] UpdateMemberRequestDto inDto)
    {
        return DeleteMemberContacts(userid, inDto);
    }

    [Create("{userid}/contacts")]
    public EmployeeFullDto SetMemberContactsFromBody(string userid, [FromBody] UpdateMemberRequestDto inDto)
    {
        return SetMemberContacts(userid, inDto);
    }

    [Create("{userid}/contacts")]
    [Consumes("application/x-www-form-urlencoded")]
    public EmployeeFullDto SetMemberContactsFromForm(string userid, [FromForm] UpdateMemberRequestDto inDto)
    {
        return SetMemberContacts(userid, inDto);
    }

    [Update("{userid}/contacts")]
    public EmployeeFullDto UpdateMemberContactsFromBody(string userid, [FromBody] UpdateMemberRequestDto inDto)
    {
        return UpdateMemberContacts(userid, inDto);
    }

    [Update("{userid}/contacts")]
    [Consumes("application/x-www-form-urlencoded")]
    public EmployeeFullDto UpdateMemberContactsFromForm(string userid, [FromForm] UpdateMemberRequestDto inDto)
    {
        return UpdateMemberContacts(userid, inDto);
    }

    private EmployeeFullDto DeleteMemberContacts(string userid, UpdateMemberRequestDto inDto)
    {
        var user = GetUserInfo(userid);

        if (_userManager.IsSystemUser(user.Id))
        {
            throw new SecurityException();
        }

        DeleteContacts(inDto.Contacts, user);
        _userManager.SaveUserInfo(user);

        return _employeeFullDtoHelper.GetFull(user);
    }

    private EmployeeFullDto SetMemberContacts(string userid, UpdateMemberRequestDto inDto)
    {
        var user = GetUserInfo(userid);

        if (_userManager.IsSystemUser(user.Id))
        {
            throw new SecurityException();
        }

        user.ContactsList.Clear();
        UpdateContacts(inDto.Contacts, user);
        _userManager.SaveUserInfo(user);

        return _employeeFullDtoHelper.GetFull(user);
    }

    private EmployeeFullDto UpdateMemberContacts(string userid, UpdateMemberRequestDto inDto)
    {
        var user = GetUserInfo(userid);

        if (_userManager.IsSystemUser(user.Id))
        {
            throw new SecurityException();
        }

        UpdateContacts(inDto.Contacts, user);
        _userManager.SaveUserInfo(user);

        return _employeeFullDtoHelper.GetFull(user);
    }

    private void DeleteContacts(IEnumerable<Contact> contacts, UserInfo user)
    {
        _permissionContext.DemandPermissions(new UserSecurityProvider(user.Id), Constants.Action_EditUser);

        if (contacts == null)
        {
            return;
        }

        if (user.ContactsList == null)
        {
            user.ContactsList = new List<string>();
        }

        foreach (var contact in contacts)
        {
            var index = user.ContactsList.IndexOf(contact.Type);
            if (index != -1)
            {
                //Remove existing
                user.ContactsList.RemoveRange(index, 2);
            }
        }
    }
}