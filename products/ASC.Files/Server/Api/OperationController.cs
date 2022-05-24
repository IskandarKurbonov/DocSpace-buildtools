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

namespace ASC.Files.Api;

public class OperationController : ApiControllerBase
{
    private readonly FileOperationDtoHelper _fileOperationWraperHelper;
    private readonly FileStorageService<string> _fileStorageServiceString;
    private readonly OperationControllerHelper<string> _operationControllerHelperString;
    private readonly OperationControllerHelper<int> _operationControllerHelperInt;

    public OperationController(
        FileOperationDtoHelper fileOperationWraperHelper,
        FileStorageService<string> fileStorageServiceString,
        OperationControllerHelper<string> operationControllerHelperString,
        OperationControllerHelper<int> operationControllerHelperInt)
    {
        _fileOperationWraperHelper = fileOperationWraperHelper;
        _fileStorageServiceString = fileStorageServiceString;
        _operationControllerHelperString = operationControllerHelperString;
        _operationControllerHelperInt = operationControllerHelperInt;
    }

    /// <summary>
    /// Start downlaod process of files and folders with ID
    /// </summary>
    /// <short>Finish file operations</short>
    /// <param name="fileConvertIds" visible="false">File ID list for download with convert to format</param>
    /// <param name="fileIds">File ID list</param>
    /// <param name="folderIds">Folder ID list</param>
    /// <category>File operations</category>
    /// <returns>Operation result</returns>
    [Update("fileops/bulkdownload")]
    public Task<IEnumerable<FileOperationDto>> BulkDownload([FromBody] DownloadRequestDto inDto)
    {
        return _operationControllerHelperString.BulkDownloadAsync(inDto);
    }

    [Update("fileops/bulkdownload")]
    [Consumes("application/x-www-form-urlencoded")]
    public Task<IEnumerable<FileOperationDto>> BulkDownloadFromForm([FromForm][ModelBinder(BinderType = typeof(DownloadModelBinder))] DownloadRequestDto inDto)
    {
        return _operationControllerHelperString.BulkDownloadAsync(inDto);
    }

    /// <summary>
    ///   Copies all the selected files and folders to the folder with the ID specified in the request
    /// </summary>
    /// <short>Copy to folder</short>
    /// <category>File operations</category>
    /// <param name="destFolderId">Destination folder ID</param>
    /// <param name="folderIds">Folder ID list</param>
    /// <param name="fileIds">File ID list</param>
    /// <param name="conflictResolveType">Overwriting behavior: skip(0), overwrite(1) or duplicate(2)</param>
    /// <param name="deleteAfter">Delete after finished</param>
    /// <returns>Operation result</returns>
    [Update("fileops/copy")]
    public Task<IEnumerable<FileOperationDto>> CopyBatchItemsFromBody([FromBody] BatchRequestDto inDto)
    {
        return _operationControllerHelperString.CopyBatchItemsAsync(inDto);
    }

    [Update("fileops/copy")]
    [Consumes("application/x-www-form-urlencoded")]
    public Task<IEnumerable<FileOperationDto>> CopyBatchItemsFromForm([FromForm][ModelBinder(BinderType = typeof(BatchModelBinder))] BatchRequestDto inDto)
    {
        return _operationControllerHelperString.CopyBatchItemsAsync(inDto);
    }

    /// <summary>
    ///   Deletes the files and folders with the IDs specified in the request
    /// </summary>
    /// <param name="folderIds">Folder ID list</param>
    /// <param name="fileIds">File ID list</param>
    /// <param name="deleteAfter">Delete after finished</param>
    /// <param name="immediately">Don't move to the Recycle Bin</param>
    /// <short>Delete files and folders</short>
    /// <category>File operations</category>
    /// <returns>Operation result</returns>
    [Update("fileops/delete")]
    public async IAsyncEnumerable<FileOperationDto> DeleteBatchItemsFromBody([FromBody] DeleteBatchRequestDto inDto)
    {
        var tasks = _fileStorageServiceString.DeleteItems("delete", inDto.FileIds.ToList(), inDto.FolderIds.ToList(), false, inDto.DeleteAfter, inDto.Immediately);

        foreach (var e in tasks)
        {
            yield return await _fileOperationWraperHelper.GetAsync(e);
        }
    }

    [Update("fileops/delete")]
    [Consumes("application/x-www-form-urlencoded")]
    public async IAsyncEnumerable<FileOperationDto> DeleteBatchItemsFromForm([FromForm][ModelBinder(BinderType = typeof(DeleteBatchModelBinder))] DeleteBatchRequestDto inDto)
    {
        var tasks = _fileStorageServiceString.DeleteItems("delete", inDto.FileIds.ToList(), inDto.FolderIds.ToList(), false, inDto.DeleteAfter, inDto.Immediately);

        foreach (var e in tasks)
        {
            yield return await _fileOperationWraperHelper.GetAsync(e);
        }
    }

    /// <summary>
    ///   Deletes all files and folders from the recycle bin
    /// </summary>
    /// <short>Clear recycle bin</short>
    /// <category>File operations</category>
    /// <returns>Operation result</returns>
    [Update("fileops/emptytrash")]
    public Task<IEnumerable<FileOperationDto>> EmptyTrashAsync()
    {
        return _operationControllerHelperInt.EmptyTrashAsync();
    }

    /// <summary>
    ///  Returns the list of all active file operations
    /// </summary>
    /// <short>Get file operations list</short>
    /// <category>File operations</category>
    /// <returns>Operation result</returns>
    [Read("fileops")]
    public async Task<IEnumerable<FileOperationDto>> GetOperationStatuses()
    {
        var result = new List<FileOperationDto>();

        foreach (var e in _fileStorageServiceString.GetTasksStatuses())
        {
            result.Add(await _fileOperationWraperHelper.GetAsync(e));
        }

        return result;
    }

    /// <summary>
    ///   Marks all files and folders as read
    /// </summary>
    /// <short>Mark as read</short>
    /// <category>File operations</category>
    /// <returns>Operation result</returns>
    [Update("fileops/markasread")]
    public Task<IEnumerable<FileOperationDto>> MarkAsReadFromBody([FromBody] BaseBatchRequestDto inDto)
    {
        return _operationControllerHelperString.MarkAsReadAsync(inDto);
    }

    [Update("fileops/markasread")]
    [Consumes("application/x-www-form-urlencoded")]
    public Task<IEnumerable<FileOperationDto>> MarkAsReadFromForm([FromForm][ModelBinder(BinderType = typeof(BaseBatchModelBinder))] BaseBatchRequestDto inDto)
    {
        return _operationControllerHelperString.MarkAsReadAsync(inDto);
    }

    /// <summary>
    ///   Moves all the selected files and folders to the folder with the ID specified in the request
    /// </summary>
    /// <short>Move to folder</short>
    /// <category>File operations</category>
    /// <param name="destFolderId">Destination folder ID</param>
    /// <param name="folderIds">Folder ID list</param>
    /// <param name="fileIds">File ID list</param>
    /// <param name="conflictResolveType">Overwriting behavior: skip(0), overwrite(1) or duplicate(2)</param>
    /// <param name="deleteAfter">Delete after finished</param>
    /// <returns>Operation result</returns>
    [Update("fileops/move")]
    public Task<IEnumerable<FileOperationDto>> MoveBatchItemsFromBody([FromBody] BatchRequestDto inDto)
    {
        return _operationControllerHelperString.MoveBatchItemsAsync(inDto);
    }

    [Update("fileops/move")]
    [Consumes("application/x-www-form-urlencoded")]
    public Task<IEnumerable<FileOperationDto>> MoveBatchItemsFromForm([FromForm][ModelBinder(BinderType = typeof(BatchModelBinder))] BatchRequestDto inDto)
    {
        return _operationControllerHelperString.MoveBatchItemsAsync(inDto);
    }

    /// <summary>
    /// Checking for conflicts
    /// </summary>
    /// <category>File operations</category>
    /// <param name="destFolderId">Destination folder ID</param>
    /// <param name="folderIds">Folder ID list</param>
    /// <param name="fileIds">File ID list</param>
    /// <returns>Conflicts file ids</returns>
    [Read("fileops/move")]
    public IAsyncEnumerable<FileEntryDto> MoveOrCopyBatchCheckAsync([ModelBinder(BinderType = typeof(BatchModelBinder))] BatchRequestDto inDto)
    {
        return _operationControllerHelperString.MoveOrCopyBatchCheckAsync(inDto);
    }
    /// <summary>
    ///  Finishes all the active file operations
    /// </summary>
    /// <short>Finish all</short>
    /// <category>File operations</category>
    /// <returns>Operation result</returns>
    [Update("fileops/terminate")]
    public async IAsyncEnumerable<FileOperationDto> TerminateTasks()
    {
        var tasks = _fileStorageServiceString.TerminateTasks();

        foreach (var e in tasks)
        {
            yield return await _fileOperationWraperHelper.GetAsync(e);
        }
    }
}