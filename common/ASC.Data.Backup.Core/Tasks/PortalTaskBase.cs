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

namespace ASC.Data.Backup.Tasks;

public class ProgressChangedEventArgs : EventArgs
{
    public int Progress { get; private set; }

    public ProgressChangedEventArgs(int progress)
    {
        Progress = progress;
    }
}

public abstract class PortalTaskBase
{
    protected const int TasksLimit = 10;

    protected StorageFactory StorageFactory { get; set; }
    protected StorageFactoryConfig StorageFactoryConfig { get; set; }
    protected ILog Logger { get; set; }
    public int Progress { get; private set; }
    public int TenantId { get; private set; }
    public string ConfigPath { get; private set; }
    public bool ProcessStorage { get; set; }
    protected ModuleProvider ModuleProvider { get; set; }
    protected DbFactory DbFactory { get; set; }

    protected readonly List<ModuleName> IgnoredModules = new List<ModuleName>();
    protected readonly List<string> IgnoredTables = new List<string>(); //todo: add using to backup and transfer tasks

    protected PortalTaskBase(DbFactory dbFactory, IOptionsMonitor<ILog> options, StorageFactory storageFactory, StorageFactoryConfig storageFactoryConfig, ModuleProvider moduleProvider)    {
        Logger = options.CurrentValue;
        ProcessStorage = true;
        StorageFactory = storageFactory;
        StorageFactoryConfig = storageFactoryConfig;
        ModuleProvider = moduleProvider;
        DbFactory = dbFactory;
    }

    public void Init(int tenantId, string configPath)
    {
        TenantId = tenantId;
        ConfigPath = configPath;
    }

    public void IgnoreModule(ModuleName moduleName)
    {
        if (!IgnoredModules.Contains(moduleName))
        {
            IgnoredModules.Add(moduleName);
        }
    }

    public void IgnoreTable(string tableName)
    {
        if (!IgnoredTables.Contains(tableName))
        {
            IgnoredTables.Add(tableName);
        }
    }

    public abstract void RunJob();

    internal virtual IEnumerable<IModuleSpecifics> GetModulesToProcess()
    {
        return ModuleProvider.AllModules.Where(module => !IgnoredModules.Contains(module.ModuleName));
    }

    protected IEnumerable<BackupFileInfo> GetFilesToProcess(int tenantId)
    {
        var files = new List<BackupFileInfo>();
        foreach (var module in StorageFactoryConfig.GetModuleList(ConfigPath).Where(IsStorageModuleAllowed))
        {
            var store = StorageFactory.GetStorage(ConfigPath, tenantId.ToString(), module);
            var domains = StorageFactoryConfig.GetDomainList(ConfigPath, module).ToArray();

            foreach (var domain in domains)
            {
                files.AddRange(
                        store.ListFilesRelativeAsync(domain, "\\", "*.*", true).ToArrayAsync().Result
                    .Select(path => new BackupFileInfo(domain, module, path, tenantId)));
            }

            files.AddRange(
                    store.ListFilesRelativeAsync(string.Empty, "\\", "*.*", true).ToArrayAsync().Result
                     .Where(path => domains.All(domain => !path.Contains(domain + "/")))
                     .Select(path => new BackupFileInfo(string.Empty, module, path, tenantId)));
        }

        return files.Distinct();
    }

    protected bool IsStorageModuleAllowed(string storageModuleName)
    {
        var allowedStorageModules = new List<string>
                {
                    "forum",
                    "photo",
                    "bookmarking",
                    "wiki",
                    "files",
                    "crm",
                    "projects",
                    "logo",
                    "fckuploaders",
                    "talk",
                    "mailaggregator",
                    "whitelabel",
                    "customnavigation",
                    "userPhotos"
                };

        if (!allowedStorageModules.Contains(storageModuleName))
        {
            return false;
        }

        var moduleSpecifics = ModuleProvider.GetByStorageModule(storageModuleName);

        return moduleSpecifics == null || !IgnoredModules.Contains(moduleSpecifics.ModuleName);
    }

    #region Progress

    public event EventHandler<ProgressChangedEventArgs> ProgressChanged;

    private int _stepsCount = 1;
    private volatile int _stepsCompleted;

    protected void SetStepsCount(int value)
    {
        if (value <= 0)
        {
                throw new ArgumentOutOfRangeException(nameof(value));
        }
        _stepsCount = value;
        Logger.Debug("Steps: " + _stepsCount);
    }

    protected void SetStepCompleted(int increment = 1)
    {
        if (_stepsCount == 1)
        {
            return;
        }
        if (_stepsCompleted == _stepsCount)
        {
            throw new InvalidOperationException("All steps completed.");
        }
        _stepsCompleted += increment;
        SetProgress(100 * _stepsCompleted / _stepsCount);
    }

    protected void SetCurrentStepProgress(int value)
    {
        if (value < 0 || value > 100)
        {
                throw new ArgumentOutOfRangeException(nameof(value));
        }
        if (value == 100)
        {
            SetStepCompleted();
        }
        else
        {
            SetProgress((100 * _stepsCompleted + value) / _stepsCount);
        }
    }

    protected void SetProgress(int value)
    {
        if (value < 0 || value > 100)
        {
                throw new ArgumentOutOfRangeException(nameof(value));
        }
        if (Progress != value)
        {
            Progress = value;
            OnProgressChanged(new ProgressChangedEventArgs(value));
        }
    }

    protected virtual void OnProgressChanged(ProgressChangedEventArgs eventArgs)
    {
        ProgressChanged?.Invoke(this, eventArgs);
    }

    #endregion

    protected Dictionary<string, string> ParseConnectionString(string connectionString)
    {
        var result = new Dictionary<string, string>();

        var parsed = connectionString.Split(';');

        foreach (var p in parsed)
        {
                if (string.IsNullOrWhiteSpace(p))
            {
                continue;
            }

            var keyValue = p.Split('=');
            result.Add(keyValue[0].ToLowerInvariant(), keyValue[1]);
        }

        return result;
    }

    protected void RunMysqlFile(string file, bool db = false)
    {
        var connectionString = ParseConnectionString(DbFactory.ConnectionStringSettings.ConnectionString);
        var args = new StringBuilder()
                .Append($"-h {connectionString["server"]} ")
                .Append($"-u {connectionString["user id"]} ")
                .Append($"-p{connectionString["password"]} ");

        if (db)
        {
                args.Append($"-D {connectionString["database"]} ");
        }

            args.Append($"-e \" source {file}\"");
        Logger.DebugFormat("run mysql file {0} {1}", file, args.ToString());

        var startInfo = new ProcessStartInfo
        {
            CreateNoWindow = false,
            UseShellExecute = false,
            FileName = "mysql",
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            WindowStyle = ProcessWindowStyle.Hidden,
            Arguments = args.ToString()
        };

        using (var proc = Process.Start(startInfo))
        {
            if (proc != null)
            {
                proc.WaitForExit();

                var error = proc.StandardError.ReadToEnd();
                Logger.Error(!string.IsNullOrEmpty(error) ? error : proc.StandardOutput.ReadToEnd());
            }
        }

        Logger.DebugFormat("complete mysql file {0}", file);
    }

        protected Task RunMysqlFile(Stream stream, string delimiter = ";")
    {
            if (stream == null)
        {
            return Task.CompletedTask;
        }

        return InternalRunMysqlFile(stream, delimiter);
        }

        private async Task InternalRunMysqlFile(Stream stream, string delimiter)
        {
        using var reader = new StreamReader(stream, Encoding.UTF8);
        string commandText;

        while ((commandText = await reader.ReadLineAsync()) != null)
        {
                var sb = new StringBuilder(commandText);
            while (!commandText.EndsWith(delimiter))
            {
                var newline = await reader.ReadLineAsync();
                if (newline == null)
                {
                    break;
                }
                    sb.Append(newline);
            }
                commandText = sb.ToString();
            try
            {

                using var connection = DbFactory.OpenConnection();
                var command = connection.CreateCommand();
                command.CommandText = commandText;
                await command.ExecuteNonQueryAsync();
                //  await dbManager.ExecuteNonQueryAsync(commandText, null);
            }
            catch (Exception e)
            {
                Logger.Error("Restore", e);
            }
        }
    }
}
