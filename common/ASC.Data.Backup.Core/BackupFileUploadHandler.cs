/*
 *
 * (c) Copyright Ascensio System Limited 2010-2021
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
*/

namespace ASC.Web.Studio.Core.Backup;

[Scope]
public class BackupFileUploadHandler
{
    private const long _maxBackupFileSize = 1024L * 1024L * 1024L;
    private const string _backupTempFolder = "backup";
    private const string _backupFileName = "backup.tmp";

    private readonly PermissionContext _permissionContext;
    private readonly TempPath _tempPath;
    private readonly TenantManager _tenantManager;

    public BackupFileUploadHandler(
        PermissionContext permissionContext,
        TempPath tempPath,
        TenantManager tenantManager)
    {
        _permissionContext = permissionContext;
        _tempPath = tempPath;
        _tenantManager = tenantManager;
    }

    public string ProcessUpload(IFormFile file)
    {
        if (file == null)
        {
            return "No files.";
        }

        if (!_permissionContext.CheckPermissions(SecutiryConstants.EditPortalSettings))
        {
            return "Access denied.";
        }

        if (file.Length <= 0 || file.Length > _maxBackupFileSize)
        {
            return $"File size must be greater than 0 and less than {_maxBackupFileSize} bytes";
        }

        try
        {
            var filePath = GetFilePath();

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }

            using (var fileStream = File.Create(filePath))
            {
                file.CopyTo(fileStream);
            }

            return string.Empty;
        }
        catch (Exception error)
        {
            return error.Message;
        }
    }

    internal string GetFilePath()
    {
        var folder = Path.Combine(_tempPath.GetTempPath(), _backupTempFolder, _tenantManager.GetCurrentTenant().Id.ToString());

        if (!Directory.Exists(folder))
        {
            Directory.CreateDirectory(folder);
        }

        return Path.Combine(folder, _backupFileName);
    }
}
