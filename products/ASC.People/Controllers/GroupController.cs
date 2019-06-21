﻿using System;
using System.Collections.Generic;
using System.Linq;
using ASC.Api.Core;
using ASC.Api.Utils;
using ASC.Common.Web;
using ASC.Core;
using ASC.Core.Users;
using ASC.MessagingSystem;
using ASC.Web.Api.Models;
using ASC.Web.Api.Routing;
using Microsoft.AspNetCore.Mvc;
using SecurityContext = ASC.Core.SecurityContext;

namespace ASC.Employee.Core.Controllers
{
    [DefaultRoute]
    [ApiController]
    public class GroupController : ControllerBase
    {
        public Common.Logging.LogManager LogManager { get; }
        public ApiContext ApiContext { get; }
        public MessageService MessageService { get; }

        public GroupController(Common.Logging.LogManager logManager, MessageService messageService)
        {
            LogManager = logManager;
            ApiContext = HttpContext;
            MessageService = messageService;
        }

        [Read, Read(false)]
        public IEnumerable<GroupWrapperSummary> GetAll()
        {
            return CoreContext.UserManager.GetDepartments().Select(x => new GroupWrapperSummary(x));
        }

        [Read("{groupid}")]
        public GroupWrapperFull GetById(Guid groupid)
        {
            return new GroupWrapperFull(GetGroupInfo(groupid), true);
        }

        [Read("user/{userid}")]
        public IEnumerable<GroupWrapperSummary> GetByUserId(Guid userid)
        {
            return CoreContext.UserManager.GetUserGroups(userid).Select(x => new GroupWrapperSummary(x));
        }

        [Create, Create(false)]
        public GroupWrapperFull AddGroup(Guid groupManager, string groupName, IEnumerable<Guid> members)
        {
            SecurityContext.DemandPermissions(Constants.Action_EditGroups, Constants.Action_AddRemoveUser);

            var group = CoreContext.UserManager.SaveGroupInfo(new GroupInfo { Name = groupName });

            TransferUserToDepartment(groupManager, @group, true);
            if (members != null)
            {
                foreach (var member in members)
                {
                    TransferUserToDepartment(member, group, false);
                }
            }

            MessageService.Send(MessageAction.GroupCreated, MessageTarget.Create(group.ID), group.Name);

            return new GroupWrapperFull(group, true);
        }

        [Update("{groupid}")]
        public GroupWrapperFull UpdateGroup(Guid groupid, Guid groupManager, string groupName, IEnumerable<Guid> members)
        {
            SecurityContext.DemandPermissions(Constants.Action_EditGroups, Constants.Action_AddRemoveUser);
            var group = CoreContext.UserManager.GetGroups().SingleOrDefault(x => x.ID == groupid).NotFoundIfNull("group not found");
            if (group.ID == Constants.LostGroupInfo.ID)
            {
                throw new ItemNotFoundException("group not found");
            }

            group.Name = groupName ?? group.Name;
            CoreContext.UserManager.SaveGroupInfo(group);

            RemoveMembersFrom(groupid, CoreContext.UserManager.GetUsersByGroup(groupid, EmployeeStatus.All).Select(u => u.ID).Where(id => !members.Contains(id)));

            TransferUserToDepartment(groupManager, @group, true);
            if (members != null)
            {
                foreach (var member in members)
                {
                    TransferUserToDepartment(member, group, false);
                }
            }

            MessageService.Send(MessageAction.GroupUpdated, MessageTarget.Create(group.ID), group.Name);

            return GetById(groupid);
        }

        [Delete("{groupid}")]
        public GroupWrapperFull DeleteGroup(Guid groupid)
        {
            SecurityContext.DemandPermissions(Constants.Action_EditGroups, Constants.Action_AddRemoveUser);
            var @group = GetGroupInfo(groupid);
            var groupWrapperFull = new GroupWrapperFull(group, false);

            CoreContext.UserManager.DeleteGroup(groupid);

            MessageService.Send(MessageAction.GroupDeleted, MessageTarget.Create(group.ID), group.Name);

            return groupWrapperFull;
        }

        private static GroupInfo GetGroupInfo(Guid groupid)
        {
            var group = CoreContext.UserManager.GetGroups().SingleOrDefault(x => x.ID == groupid).NotFoundIfNull("group not found");
            if (group.ID == Constants.LostGroupInfo.ID)
                throw new ItemNotFoundException("group not found");
            return @group;
        }

        [Update("{groupid}/members/{newgroupid}")]
        public GroupWrapperFull TransferMembersTo(Guid groupid, Guid newgroupid)
        {
            SecurityContext.DemandPermissions(Constants.Action_EditGroups, Constants.Action_AddRemoveUser);
            var oldgroup = GetGroupInfo(groupid);

            var newgroup = GetGroupInfo(newgroupid);

            var users = CoreContext.UserManager.GetUsersByGroup(oldgroup.ID);
            foreach (var userInfo in users)
            {
                TransferUserToDepartment(userInfo.ID, newgroup, false);
            }
            return GetById(newgroupid);
        }

        [Create("{groupid}/members"), Create("{groupid}/members", false)]
        public GroupWrapperFull SetMembersTo(Guid groupid, IEnumerable<Guid> members)
        {
            RemoveMembersFrom(groupid, CoreContext.UserManager.GetUsersByGroup(groupid).Select(x => x.ID));
            AddMembersTo(groupid, members);
            return GetById(groupid);
        }

        [Update("{groupid}/members"), Update("{groupid}/members", false)]
        public GroupWrapperFull AddMembersTo(Guid groupid, IEnumerable<Guid> members)
        {
            SecurityContext.DemandPermissions(Constants.Action_EditGroups, Constants.Action_AddRemoveUser);
            var group = GetGroupInfo(groupid);

            foreach (var userId in members)
            {
                TransferUserToDepartment(userId, group, false);
            }
            return GetById(group.ID);
        }

        [Update("{groupid}/manager"), Update("{groupid}/manager", false)]
        public GroupWrapperFull SetManager(Guid groupid, Guid userid)
        {
            var group = GetGroupInfo(groupid);
            if (CoreContext.UserManager.UserExists(userid))
            {
                CoreContext.UserManager.SetDepartmentManager(group.ID, userid);
            }
            else
            {
                throw new ItemNotFoundException("user not found");
            }
            return GetById(groupid);
        }

        [Delete("{groupid}/members"), Delete("{groupid}/members", false)]
        public GroupWrapperFull RemoveMembersFrom(Guid groupid, IEnumerable<Guid> members)
        {
            SecurityContext.DemandPermissions(Constants.Action_EditGroups, Constants.Action_AddRemoveUser);
            var group = GetGroupInfo(groupid);

            foreach (var userId in members)
            {
                RemoveUserFromDepartment(userId, group);
            }
            return GetById(group.ID);
        }

        private static void RemoveUserFromDepartment(Guid userId, GroupInfo @group)
        {
            if (!CoreContext.UserManager.UserExists(userId)) return;

            var user = CoreContext.UserManager.GetUsers(userId);
            CoreContext.UserManager.RemoveUserFromGroup(user.ID, @group.ID);
            CoreContext.UserManager.SaveUserInfo(user);
        }

        private static void TransferUserToDepartment(Guid userId, GroupInfo group, bool setAsManager)
        {
            if (!CoreContext.UserManager.UserExists(userId) && userId != Guid.Empty) return;

            if (setAsManager)
            {
                CoreContext.UserManager.SetDepartmentManager(@group.ID, userId);
            }
            CoreContext.UserManager.AddUserIntoGroup(userId, @group.ID);
        }
    }
}