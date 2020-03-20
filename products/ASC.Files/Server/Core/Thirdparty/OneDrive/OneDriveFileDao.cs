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
using System.IO;
using System.Linq;

using ASC.Common;
using ASC.Common.Logging;
using ASC.Core;
using ASC.Core.Common.EF;
using ASC.Core.Tenants;
using ASC.Files.Core;
using ASC.Files.Core.EF;
using ASC.Files.Resources;
using ASC.Web.Core.Files;
using ASC.Web.Files.Services.DocumentService;
using ASC.Web.Studio.Core;

using Microsoft.Extensions.Options;
using Microsoft.OneDrive.Sdk;

namespace ASC.Files.Thirdparty.OneDrive
{
    internal class OneDriveFileDao : OneDriveDaoBase, IFileDao<string>
    {
        public OneDriveFileDao(IServiceProvider serviceProvider, UserManager userManager, TenantManager tenantManager, TenantUtil tenantUtil, DbContextManager<FilesDbContext> dbContextManager, SetupInfo setupInfo, IOptionsMonitor<ILog> monitor, FileUtility fileUtility) : base(serviceProvider, userManager, tenantManager, tenantUtil, dbContextManager, setupInfo, monitor, fileUtility)
        {
        }

        public void InvalidateCache(string fileId)
        {
            var onedriveFileId = MakeOneDriveId(fileId);
            ProviderInfo.CacheReset(onedriveFileId);

            var onedriveFile = GetOneDriveItem(fileId);
            var parentId = GetParentFolderId(onedriveFile);
            if (parentId != null) ProviderInfo.CacheReset(parentId);
        }

        public File<string> GetFile(string fileId)
        {
            return GetFile(fileId, 1);
        }

        public File<string> GetFile(string fileId, int fileVersion)
        {
            return ToFile(GetOneDriveItem(fileId));
        }

        public File<string> GetFile(string parentId, string title)
        {
            return ToFile(GetOneDriveItems(parentId, false)
                              .FirstOrDefault(item => item.Name.Equals(title, StringComparison.InvariantCultureIgnoreCase) && item.File != null));
        }

        public File<string> GetFileStable(string fileId, int fileVersion)
        {
            return ToFile(GetOneDriveItem(fileId));
        }

        public List<File<string>> GetFileHistory(string fileId)
        {
            return new List<File<string>> { GetFile(fileId) };
        }

        public List<File<string>> GetFiles(string[] fileIds)
        {
            if (fileIds == null || fileIds.Length == 0) return new List<File<string>>();
            return fileIds.Select(GetOneDriveItem).Select(ToFile).ToList();
        }

        public List<File<string>> GetFilesForShare(string[] fileIds, FilterType filterType, bool subjectGroup, Guid subjectID, string searchText, bool searchInContent)
        {
            if (fileIds == null || fileIds.Length == 0 || filterType == FilterType.FoldersOnly) return new List<File<string>>();

            var files = GetFiles(fileIds).AsEnumerable();

            //Filter
            if (subjectID != Guid.Empty)
            {
                files = files.Where(x => subjectGroup
                                             ? UserManager.IsUserInGroup(x.CreateBy, subjectID)
                                             : x.CreateBy == subjectID);
            }

            switch (filterType)
            {
                case FilterType.FoldersOnly:
                    return new List<File<string>>();
                case FilterType.DocumentsOnly:
                    files = files.Where(x => FileUtility.GetFileTypeByFileName(x.Title) == FileType.Document);
                    break;
                case FilterType.PresentationsOnly:
                    files = files.Where(x => FileUtility.GetFileTypeByFileName(x.Title) == FileType.Presentation);
                    break;
                case FilterType.SpreadsheetsOnly:
                    files = files.Where(x => FileUtility.GetFileTypeByFileName(x.Title) == FileType.Spreadsheet);
                    break;
                case FilterType.ImagesOnly:
                    files = files.Where(x => FileUtility.GetFileTypeByFileName(x.Title) == FileType.Image);
                    break;
                case FilterType.ArchiveOnly:
                    files = files.Where(x => FileUtility.GetFileTypeByFileName(x.Title) == FileType.Archive);
                    break;
                case FilterType.MediaOnly:
                    files = files.Where(x =>
                        {
                            FileType fileType;
                            return (fileType = FileUtility.GetFileTypeByFileName(x.Title)) == FileType.Audio || fileType == FileType.Video;
                        });
                    break;
                case FilterType.ByExtension:
                    if (!string.IsNullOrEmpty(searchText))
                        files = files.Where(x => FileUtility.GetFileExtension(x.Title).Contains(searchText));
                    break;
            }

            if (!string.IsNullOrEmpty(searchText))
                files = files.Where(x => x.Title.IndexOf(searchText, StringComparison.OrdinalIgnoreCase) != -1);

            return files.ToList();
        }

        public List<string> GetFiles(string parentId)
        {
            return GetOneDriveItems(parentId, false).Select(entry => MakeId(entry.Id)).ToList();
        }

        public List<File<string>> GetFiles(string parentId, OrderBy orderBy, FilterType filterType, bool subjectGroup, Guid subjectID, string searchText, bool searchInContent, bool withSubfolders = false)
        {
            if (filterType == FilterType.FoldersOnly) return new List<File<string>>();

            //Get only files
            var files = GetOneDriveItems(parentId, false).Select(ToFile);

            //Filter
            if (subjectID != Guid.Empty)
            {
                files = files.Where(x => subjectGroup
                                             ? UserManager.IsUserInGroup(x.CreateBy, subjectID)
                                             : x.CreateBy == subjectID);
            }

            switch (filterType)
            {
                case FilterType.FoldersOnly:
                    return new List<File<string>>();
                case FilterType.DocumentsOnly:
                    files = files.Where(x => FileUtility.GetFileTypeByFileName(x.Title) == FileType.Document);
                    break;
                case FilterType.PresentationsOnly:
                    files = files.Where(x => FileUtility.GetFileTypeByFileName(x.Title) == FileType.Presentation);
                    break;
                case FilterType.SpreadsheetsOnly:
                    files = files.Where(x => FileUtility.GetFileTypeByFileName(x.Title) == FileType.Spreadsheet);
                    break;
                case FilterType.ImagesOnly:
                    files = files.Where(x => FileUtility.GetFileTypeByFileName(x.Title) == FileType.Image);
                    break;
                case FilterType.ArchiveOnly:
                    files = files.Where(x => FileUtility.GetFileTypeByFileName(x.Title) == FileType.Archive);
                    break;
                case FilterType.MediaOnly:
                    files = files.Where(x =>
                        {
                            FileType fileType;
                            return (fileType = FileUtility.GetFileTypeByFileName(x.Title)) == FileType.Audio || fileType == FileType.Video;
                        });
                    break;
                case FilterType.ByExtension:
                    if (!string.IsNullOrEmpty(searchText))
                        files = files.Where(x => FileUtility.GetFileExtension(x.Title).Contains(searchText));
                    break;
            }

            if (!string.IsNullOrEmpty(searchText))
                files = files.Where(x => x.Title.IndexOf(searchText, StringComparison.OrdinalIgnoreCase) != -1);

            if (orderBy == null) orderBy = new OrderBy(SortedByType.DateAndTime, false);

            switch (orderBy.SortedBy)
            {
                case SortedByType.Author:
                    files = orderBy.IsAsc ? files.OrderBy(x => x.CreateBy) : files.OrderByDescending(x => x.CreateBy);
                    break;
                case SortedByType.AZ:
                    files = orderBy.IsAsc ? files.OrderBy(x => x.Title) : files.OrderByDescending(x => x.Title);
                    break;
                case SortedByType.DateAndTime:
                    files = orderBy.IsAsc ? files.OrderBy(x => x.ModifiedOn) : files.OrderByDescending(x => x.ModifiedOn);
                    break;
                case SortedByType.DateAndTimeCreation:
                    files = orderBy.IsAsc ? files.OrderBy(x => x.CreateOn) : files.OrderByDescending(x => x.CreateOn);
                    break;
                default:
                    files = orderBy.IsAsc ? files.OrderBy(x => x.Title) : files.OrderByDescending(x => x.Title);
                    break;
            }

            return files.ToList();
        }

        public Stream GetFileStream(File<string> file)
        {
            return GetFileStream(file, 0);
        }

        public Stream GetFileStream(File<string> file, long offset)
        {
            var onedriveFileId = MakeOneDriveId(file.ID);
            ProviderInfo.CacheReset(onedriveFileId);

            var onedriveFile = GetOneDriveItem(file.ID);
            if (onedriveFile == null) throw new ArgumentNullException("file", FilesCommonResource.ErrorMassage_FileNotFound);
            if (onedriveFile is ErrorItem) throw new Exception(((ErrorItem)onedriveFile).Error);

            var fileStream = ProviderInfo.Storage.DownloadStream(onedriveFile, (int)offset);

            return fileStream;
        }

        public Uri GetPreSignedUri(File<string> file, TimeSpan expires)
        {
            throw new NotSupportedException();
        }

        public bool IsSupportedPreSignedUri(File<string> file)
        {
            return false;
        }

        public File<string> SaveFile(File<string> file, Stream fileStream)
        {
            if (file == null) throw new ArgumentNullException("file");
            if (fileStream == null) throw new ArgumentNullException("fileStream");

            Item newOneDriveFile = null;

            if (file.ID != null)
            {
                newOneDriveFile = ProviderInfo.Storage.SaveStream(MakeOneDriveId(file.ID), fileStream);
                if (!newOneDriveFile.Name.Equals(file.Title))
                {
                    file.Title = GetAvailableTitle(file.Title, GetParentFolderId(newOneDriveFile), IsExist);
                    newOneDriveFile = ProviderInfo.Storage.RenameItem(newOneDriveFile.Id, file.Title);
                }
            }
            else if (file.FolderID != null)
            {
                var folderId = MakeOneDriveId(file.FolderID);
                var folder = GetOneDriveItem(folderId);
                file.Title = GetAvailableTitle(file.Title, folderId, IsExist);
                newOneDriveFile = ProviderInfo.Storage.CreateFile(fileStream, file.Title, MakeOneDrivePath(folder));
            }

            if (newOneDriveFile != null) ProviderInfo.CacheReset(newOneDriveFile.Id);
            var parentId = GetParentFolderId(newOneDriveFile);
            if (parentId != null) ProviderInfo.CacheReset(parentId);

            return ToFile(newOneDriveFile);
        }

        public File<string> ReplaceFileVersion(File<string> file, Stream fileStream)
        {
            return SaveFile(file, fileStream);
        }

        public void DeleteFile(string fileId)
        {
            var onedriveFile = GetOneDriveItem(fileId);
            if (onedriveFile == null) return;
            var id = MakeId(onedriveFile.Id);

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

            if (!(onedriveFile is ErrorItem))
                ProviderInfo.Storage.DeleteItem(onedriveFile);

            ProviderInfo.CacheReset(onedriveFile.Id);
            var parentFolderId = GetParentFolderId(onedriveFile);
            if (parentFolderId != null) ProviderInfo.CacheReset(parentFolderId);
        }

        public bool IsExist(string title, object folderId)
        {
            return GetOneDriveItems(folderId.ToString(), false)
                .Any(item => item.Name.Equals(title, StringComparison.InvariantCultureIgnoreCase));
        }

        public string MoveFile(string fileId, string toFolderId)
        {
            var onedriveFile = GetOneDriveItem(fileId);
            if (onedriveFile is ErrorItem) throw new Exception(((ErrorItem)onedriveFile).Error);

            var toOneDriveFolder = GetOneDriveItem(toFolderId);
            if (toOneDriveFolder is ErrorItem) throw new Exception(((ErrorItem)toOneDriveFolder).Error);

            var fromFolderId = GetParentFolderId(onedriveFile);

            var newTitle = GetAvailableTitle(onedriveFile.Name, toOneDriveFolder.Id, IsExist);
            onedriveFile = ProviderInfo.Storage.MoveItem(onedriveFile.Id, newTitle, toOneDriveFolder.Id);

            ProviderInfo.CacheReset(onedriveFile.Id);
            ProviderInfo.CacheReset(fromFolderId);
            ProviderInfo.CacheReset(toOneDriveFolder.Id);

            return MakeId(onedriveFile.Id);
        }

        public File<string> CopyFile(string fileId, string toFolderId)
        {
            var onedriveFile = GetOneDriveItem(fileId);
            if (onedriveFile is ErrorItem) throw new Exception(((ErrorItem)onedriveFile).Error);

            var toOneDriveFolder = GetOneDriveItem(toFolderId);
            if (toOneDriveFolder is ErrorItem) throw new Exception(((ErrorItem)toOneDriveFolder).Error);

            var newTitle = GetAvailableTitle(onedriveFile.Name, toOneDriveFolder.Id, IsExist);
            var newOneDriveFile = ProviderInfo.Storage.CopyItem(onedriveFile.Id, newTitle, toOneDriveFolder.Id);

            ProviderInfo.CacheReset(newOneDriveFile.Id);
            ProviderInfo.CacheReset(toOneDriveFolder.Id);

            return ToFile(newOneDriveFile);
        }

        public string FileRename(File<string> file, string newTitle)
        {
            var onedriveFile = GetOneDriveItem(file.ID);
            newTitle = GetAvailableTitle(newTitle, GetParentFolderId(onedriveFile), IsExist);

            onedriveFile = ProviderInfo.Storage.RenameItem(onedriveFile.Id, newTitle);

            ProviderInfo.CacheReset(onedriveFile.Id);
            var parentId = GetParentFolderId(onedriveFile);
            if (parentId != null) ProviderInfo.CacheReset(parentId);

            return MakeId(onedriveFile.Id);
        }

        public string UpdateComment(string fileId, int fileVersion, string comment)
        {
            return string.Empty;
        }

        public void CompleteVersion(string fileId, int fileVersion)
        {
        }

        public void ContinueVersion(string fileId, int fileVersion)
        {
        }

        public bool UseTrashForRemove(File<string> file)
        {
            return false;
        }

        #region chunking

        private File<string> RestoreIds(File<string> file)
        {
            if (file == null) return null;

            if (file.ID != null)
                file.ID = MakeId(file.ID.ToString());

            if (file.FolderID != null)
                file.FolderID = MakeId(file.FolderID.ToString());

            return file;
        }

        public ChunkedUploadSession<string> CreateUploadSession(File<string> file, long contentLength)
        {
            if (SetupInfo.ChunkUploadSize > contentLength)
                return new ChunkedUploadSession<string>(RestoreIds(file), contentLength) { UseChunks = false };

            var uploadSession = new ChunkedUploadSession<string>(file, contentLength);

            Item onedriveFile;
            if (file.ID != null)
            {
                onedriveFile = GetOneDriveItem(file.ID);
            }
            else
            {
                var folder = GetOneDriveItem(file.FolderID);
                onedriveFile = new Item { Name = file.Title, ParentReference = new ItemReference { Id = folder.Id } };
            }

            var onedriveSession = ProviderInfo.Storage.CreateResumableSession(onedriveFile, contentLength);
            if (onedriveSession != null)
            {
                uploadSession.Items["OneDriveSession"] = onedriveSession;
            }
            else
            {
                uploadSession.Items["TempPath"] = Path.GetTempFileName();
            }

            uploadSession.File = RestoreIds(uploadSession.File);
            return uploadSession;
        }

        public void UploadChunk(ChunkedUploadSession<string> uploadSession, Stream stream, long chunkLength)
        {
            if (!uploadSession.UseChunks)
            {
                if (uploadSession.BytesTotal == 0)
                    uploadSession.BytesTotal = chunkLength;

                uploadSession.File = SaveFile(uploadSession.File, stream);
                uploadSession.BytesUploaded = chunkLength;
                return;
            }

            if (uploadSession.Items.ContainsKey("OneDriveSession"))
            {
                var oneDriveSession = uploadSession.GetItemOrDefault<ResumableUploadSession>("OneDriveSession");
                ProviderInfo.Storage.Transfer(oneDriveSession, stream, chunkLength);
            }
            else
            {
                var tempPath = uploadSession.GetItemOrDefault<string>("TempPath");
                using (var fs = new FileStream(tempPath, FileMode.Append))
                {
                    stream.CopyTo(fs);
                }
            }

            uploadSession.BytesUploaded += chunkLength;

            if (uploadSession.BytesUploaded == uploadSession.BytesTotal)
            {
                uploadSession.File = FinalizeUploadSession(uploadSession);
            }
            else
            {
                uploadSession.File = RestoreIds(uploadSession.File);
            }
        }

        private File<string> FinalizeUploadSession(ChunkedUploadSession<string> uploadSession)
        {
            if (uploadSession.Items.ContainsKey("OneDriveSession"))
            {
                var oneDriveSession = uploadSession.GetItemOrDefault<ResumableUploadSession>("OneDriveSession");

                ProviderInfo.CacheReset(oneDriveSession.FileId);
                var parentDriveId = oneDriveSession.FolderId;
                if (parentDriveId != null) ProviderInfo.CacheReset(parentDriveId);

                return ToFile(GetOneDriveItem(oneDriveSession.FileId));
            }

            using (var fs = new FileStream(uploadSession.GetItemOrDefault<string>("TempPath"), FileMode.Open, FileAccess.Read, FileShare.None, 4096, FileOptions.DeleteOnClose))
            {
                return SaveFile(uploadSession.File, fs);
            }
        }

        public void AbortUploadSession(ChunkedUploadSession<string> uploadSession)
        {
            if (uploadSession.Items.ContainsKey("OneDriveSession"))
            {
                var oneDriveSession = uploadSession.GetItemOrDefault<ResumableUploadSession>("OneDriveSession");

                if (oneDriveSession.Status != ResumableUploadSessionStatus.Completed)
                {
                    ProviderInfo.Storage.CancelTransfer(oneDriveSession);

                    oneDriveSession.Status = ResumableUploadSessionStatus.Aborted;
                }
            }
            else if (uploadSession.Items.ContainsKey("TempPath"))
            {
                System.IO.File.Delete(uploadSession.GetItemOrDefault<string>("TempPath"));
            }
        }

        #endregion


        #region Only in TMFileDao

        public void ReassignFiles(string[] fileIds, Guid newOwnerId)
        {
        }

        public List<File<string>> GetFiles(string[] parentIds, FilterType filterType, bool subjectGroup, Guid subjectID, string searchText, bool searchInContent)
        {
            return new List<File<string>>();
        }

        public IEnumerable<File<string>> Search(string text, bool bunch)
        {
            return null;
        }

        public bool IsExistOnStorage(File<string> file)
        {
            return true;
        }

        public void SaveEditHistory(File<string> file, string changes, Stream differenceStream)
        {
            //Do nothing
        }

        public List<EditHistory> GetEditHistory(DocumentServiceHelper documentServiceHelper, string fileId, int fileVersion)
        {
            return null;
        }

        public Stream GetDifferenceStream(File<string> file)
        {
            return null;
        }

        public bool ContainChanges(string fileId, int fileVersion)
        {
            return false;
        }

        public string GetUniqFilePath(File<string> file, string fileTitle)
        {
            throw new NotImplementedException();
        }

        public string MoveFile(string fileId, int toFolderId)
        {
            throw new NotImplementedException();
        }

        int IFileDao<string>.MoveFile(string fileId, int toFolderId)
        {
            throw new NotImplementedException();
        }

        #endregion
    }

    public static class OneDriveFileDaoExtention
    {
        public static DIHelper AddOneDriveFileDaoService(this DIHelper services)
        {
            services.TryAddScoped<OneDriveFileDao>();

            return services;
        }
    }
}