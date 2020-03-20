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
using System.Linq;
using System.Net;
using System.Security;
using System.Threading;

using AppLimit.CloudComputing.SharpBox;
using AppLimit.CloudComputing.SharpBox.Exceptions;

using ASC.Common;
using ASC.Common.Logging;
using ASC.Core;
using ASC.Core.Common.EF;
using ASC.Core.Tenants;
using ASC.Files.Core;
using ASC.Files.Core.EF;
using ASC.Files.Resources;
using ASC.Web.Core.Files;
using ASC.Web.Studio.Core;

using Microsoft.Extensions.Options;

namespace ASC.Files.Thirdparty.Sharpbox
{
    internal class SharpBoxFolderDao : SharpBoxDaoBase, IFolderDao<string>
    {
        public SharpBoxFolderDao(IServiceProvider serviceProvider, UserManager userManager, TenantManager tenantManager, TenantUtil tenantUtil, DbContextManager<FilesDbContext> dbContextManager, SetupInfo setupInfo, IOptionsMonitor<ILog> monitor, FileUtility fileUtility) : base(serviceProvider, userManager, tenantManager, tenantUtil, dbContextManager, setupInfo, monitor, fileUtility)
        {
        }

        public Folder<string> GetFolder(string folderId)
        {
            return ToFolder(GetFolderById(folderId));
        }

        public Folder<string> GetFolder(string title, string parentId)
        {
            var parentFolder = ProviderInfo.Storage.GetFolder(MakePath(parentId));
            return ToFolder(parentFolder.OfType<ICloudDirectoryEntry>().FirstOrDefault(x => x.Name.Equals(title, StringComparison.OrdinalIgnoreCase)));
        }

        public Folder<string> GetRootFolder(string folderId)
        {
            return ToFolder(RootFolder());
        }

        public Folder<string> GetRootFolderByFile(string fileId)
        {
            return ToFolder(RootFolder());
        }

        public List<Folder<string>> GetFolders(string parentId)
        {
            var parentFolder = ProviderInfo.Storage.GetFolder(MakePath(parentId));
            return parentFolder.OfType<ICloudDirectoryEntry>().Select(ToFolder).ToList();
        }

        public List<Folder<string>> GetFolders(string parentId, OrderBy orderBy, FilterType filterType, bool subjectGroup, Guid subjectID, string searchText, bool withSubfolders = false)
        {
            if (filterType == FilterType.FilesOnly || filterType == FilterType.ByExtension
                || filterType == FilterType.DocumentsOnly || filterType == FilterType.ImagesOnly
                || filterType == FilterType.PresentationsOnly || filterType == FilterType.SpreadsheetsOnly
                || filterType == FilterType.ArchiveOnly || filterType == FilterType.MediaOnly)
                return new List<Folder<string>>();

            var folders = GetFolders(parentId).AsEnumerable(); //TODO:!!!

            //Filter
            if (subjectID != Guid.Empty)
            {
                folders = folders.Where(x => subjectGroup
                                                 ? UserManager.IsUserInGroup(x.CreateBy, subjectID)
                                                 : x.CreateBy == subjectID);
            }

            if (!string.IsNullOrEmpty(searchText))
                folders = folders.Where(x => x.Title.IndexOf(searchText, StringComparison.OrdinalIgnoreCase) != -1);

            if (orderBy == null) orderBy = new OrderBy(SortedByType.DateAndTime, false);

            switch (orderBy.SortedBy)
            {
                case SortedByType.Author:
                    folders = orderBy.IsAsc ? folders.OrderBy(x => x.CreateBy) : folders.OrderByDescending(x => x.CreateBy);
                    break;
                case SortedByType.AZ:
                    folders = orderBy.IsAsc ? folders.OrderBy(x => x.Title) : folders.OrderByDescending(x => x.Title);
                    break;
                case SortedByType.DateAndTime:
                    folders = orderBy.IsAsc ? folders.OrderBy(x => x.ModifiedOn) : folders.OrderByDescending(x => x.ModifiedOn);
                    break;
                case SortedByType.DateAndTimeCreation:
                    folders = orderBy.IsAsc ? folders.OrderBy(x => x.CreateOn) : folders.OrderByDescending(x => x.CreateOn);
                    break;
                default:
                    folders = orderBy.IsAsc ? folders.OrderBy(x => x.Title) : folders.OrderByDescending(x => x.Title);
                    break;
            }

            return folders.ToList();
        }

        public List<Folder<string>> GetFolders(string[] folderIds, FilterType filterType = FilterType.None, bool subjectGroup = false, Guid? subjectID = null, string searchText = "", bool searchSubfolders = false, bool checkShare = true)
        {
            if (filterType == FilterType.FilesOnly || filterType == FilterType.ByExtension
                || filterType == FilterType.DocumentsOnly || filterType == FilterType.ImagesOnly
                || filterType == FilterType.PresentationsOnly || filterType == FilterType.SpreadsheetsOnly
                || filterType == FilterType.ArchiveOnly || filterType == FilterType.MediaOnly)
                return new List<Folder<string>>();

            var folders = folderIds.Select(GetFolder);

            if (subjectID.HasValue && subjectID != Guid.Empty)
            {
                folders = folders.Where(x => subjectGroup
                                                 ? UserManager.IsUserInGroup(x.CreateBy, subjectID.Value)
                                                 : x.CreateBy == subjectID);
            }

            if (!string.IsNullOrEmpty(searchText))
                folders = folders.Where(x => x.Title.IndexOf(searchText, StringComparison.OrdinalIgnoreCase) != -1);

            return folders.ToList();
        }

        public List<Folder<string>> GetParentFolders(string folderId)
        {
            var path = new List<Folder<string>>();
            var folder = GetFolderById(folderId);
            if (folder != null)
            {
                do
                {
                    path.Add(ToFolder(folder));
                } while ((folder = folder.Parent) != null);
            }
            path.Reverse();
            return path;
        }

        public string SaveFolder(Folder<string> folder)
        {
            try
            {
                if (folder.ID != null)
                {
                    //Create with id
                    var savedfolder = ProviderInfo.Storage.CreateFolder(MakePath(folder.ID));
                    return MakeId(savedfolder);
                }
                if (folder.ParentFolderID != null)
                {
                    var parentFolder = GetFolderById(folder.ParentFolderID);

                    folder.Title = GetAvailableTitle(folder.Title, parentFolder, IsExist);

                    var newFolder = ProviderInfo.Storage.CreateFolder(folder.Title, parentFolder);
                    return MakeId(newFolder);
                }
            }
            catch (SharpBoxException e)
            {
                var webException = (WebException)e.InnerException;
                if (webException != null)
                {
                    var response = ((HttpWebResponse)webException.Response);
                    if (response != null)
                    {
                        if (response.StatusCode == HttpStatusCode.Unauthorized || response.StatusCode == HttpStatusCode.Forbidden)
                        {
                            throw new SecurityException(FilesCommonResource.ErrorMassage_SecurityException_Create);
                        }
                    }
                    throw;
                }
            }
            return null;
        }

        public void DeleteFolder(string folderId)
        {
            var folder = GetFolderById(folderId);
            var id = MakeId(folder);

            using (var tx = FilesDbContext.Database.BeginTransaction())
            {
                var hashIDs = Query(FilesDbContext.ThirdpartyIdMapping)
                   .Where(r => r.Id.StartsWith(id))
                   .Select(r => r.HashId)
                   .ToList();

                var link = Query(FilesDbContext.TagLink)
                    .Where(r => hashIDs.Any(h => h == r.EntryId))
                    .ToList();

                FilesDbContext.TagLink.RemoveRange(link);
                FilesDbContext.SaveChanges();

                var tagsToRemove = Query(FilesDbContext.Tag)
                    .Where(r => !Query(FilesDbContext.TagLink).Where(a => a.TagId == r.Id).Any());

                FilesDbContext.Tag.RemoveRange(tagsToRemove);

                var securityToDelete = Query(FilesDbContext.Security)
                    .Where(r => hashIDs.Any(h => h == r.EntryId));

                FilesDbContext.Security.RemoveRange(securityToDelete);
                FilesDbContext.SaveChanges();

                var mappingToDelete = Query(FilesDbContext.ThirdpartyIdMapping)
                    .Where(r => hashIDs.Any(h => h == r.HashId));

                FilesDbContext.ThirdpartyIdMapping.RemoveRange(mappingToDelete);
                FilesDbContext.SaveChanges();

                tx.Commit();
            }

            if (!(folder is ErrorEntry))
                ProviderInfo.Storage.DeleteFileSystemEntry(folder);
        }

        public bool IsExist(string title, ICloudDirectoryEntry folder)
        {
            try
            {
                return ProviderInfo.Storage.GetFileSystemObject(title, folder) != null;
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (Exception)
            {

            }
            return false;
        }

        public string MoveFolder(string folderId, string toFolderId, CancellationToken? cancellationToken)
        {
            var entry = GetFolderById(folderId);
            var folder = GetFolderById(toFolderId);

            var oldFolderId = MakeId(entry);

            if (!ProviderInfo.Storage.MoveFileSystemEntry(entry, folder))
                throw new Exception("Error while moving");

            var newFolderId = MakeId(entry);

            UpdatePathInDB(oldFolderId, newFolderId);

            return newFolderId;
        }

        public Folder<string> CopyFolder(string folderId, string toFolderId, CancellationToken? cancellationToken)
        {
            var folder = GetFolderById(folderId);
            if (!ProviderInfo.Storage.CopyFileSystemEntry(MakePath(folderId), MakePath(toFolderId)))
                throw new Exception("Error while copying");
            return ToFolder(GetFolderById(toFolderId).OfType<ICloudDirectoryEntry>().FirstOrDefault(x => x.Name == folder.Name));
        }

        public IDictionary<string, string> CanMoveOrCopy(string[] folderIds, string to)
        {
            return new Dictionary<string, string>();
        }

        public string RenameFolder(Folder<string> folder, string newTitle)
        {
            var entry = GetFolderById(folder.ID);

            var oldId = MakeId(entry);
            var newId = oldId;

            if ("/".Equals(MakePath(folder.ID)))
            {
                //It's root folder
                DaoSelector.RenameProvider(ProviderInfo, newTitle);
                //rename provider customer title
            }
            else
            {
                var parentFolder = GetFolderById(folder.ParentFolderID);
                newTitle = GetAvailableTitle(newTitle, parentFolder, IsExist);

                //rename folder
                if (ProviderInfo.Storage.RenameFileSystemEntry(entry, newTitle))
                {
                    //Folder data must be already updated by provider
                    //We can't search google folders by title because root can have multiple folders with the same name
                    //var newFolder = SharpBoxProviderInfo.Storage.GetFileSystemObject(newTitle, folder.Parent);
                    newId = MakeId(entry);
                }
            }

            UpdatePathInDB(oldId, newId);

            return newId;
        }

        public int GetItemsCount(string folderId)
        {
            throw new NotImplementedException();
        }

        public bool IsEmpty(string folderId)
        {
            return GetFolderById(folderId).Count == 0;
        }

        public bool UseTrashForRemove(Folder<string> folder)
        {
            return false;
        }

        public bool UseRecursiveOperation(string folderId, string toRootFolderId)
        {
            return false;
        }

        public bool CanCalculateSubitems(string entryId)
        {
            return false;
        }

        public long GetMaxUploadSize(string folderId, bool chunkedUpload)
        {
            var storageMaxUploadSize =
                chunkedUpload
                    ? ProviderInfo.Storage.CurrentConfiguration.Limits.MaxChunkedUploadFileSize
                    : ProviderInfo.Storage.CurrentConfiguration.Limits.MaxUploadFileSize;

            if (storageMaxUploadSize == -1)
                storageMaxUploadSize = long.MaxValue;

            return chunkedUpload ? storageMaxUploadSize : Math.Min(storageMaxUploadSize, SetupInfo.AvailableFileSize);
        }

        #region Only for TMFolderDao

        public void ReassignFolders(string[] folderIds, Guid newOwnerId)
        {
        }

        public IEnumerable<Folder<string>> Search(string text, bool bunch)
        {
            return null;
        }

        public string GetFolderID(string module, string bunch, string data, bool createIfNotExists)
        {
            return null;
        }

        public IEnumerable<string> GetFolderIDs(string module, string bunch, IEnumerable<string> data, bool createIfNotExists)
        {
            return new List<string>();
        }

        public string GetFolderIDCommon(bool createIfNotExists)
        {
            return null;
        }

        public string GetFolderIDUser(bool createIfNotExists, Guid? userId)
        {
            return null;
        }

        public string GetFolderIDShare(bool createIfNotExists)
        {
            return null;
        }

        public string GetFolderIDTrash(bool createIfNotExists, Guid? userId)
        {
            return null;
        }


        public string GetFolderIDPhotos(bool createIfNotExists)
        {
            return null;
        }
        public string GetFolderIDProjects(bool createIfNotExists)
        {
            return null;
        }

        public string GetBunchObjectID(string folderID)
        {
            return null;
        }

        public Dictionary<string, string> GetBunchObjectIDs(List<string> folderIDs)
        {
            return null;
        }

        public int MoveFolder(string folderId, int toFolderId, CancellationToken? cancellationToken)
        {
            throw new NotImplementedException();
        }

        #endregion
    }

    public static class SharpBoxFolderDaoExtention
    {
        public static DIHelper AddSharpBoxFolderDaoService(this DIHelper services)
        {
            services.TryAddScoped<SharpBoxFileDao>();

            return services;
        }
    }
}