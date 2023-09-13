import axios from "axios";
import { uploadFile } from "@docspace/common/api/files";
import { combineUrl } from "@docspace/common/utils";
import { makeAutoObservable, runInAction } from "mobx";
import {
  migrationList,
  migrationName,
  migrationStatus,
  migrationCancel,
  migrationLog,
  migrateFile,
} from "@docspace/common/api/settings";

class ImportAccountsStore {
  checkedAccounts = [];
  services = [];
  users = [];
  existUsers = [];
  withoutEmailUsers = [];
  isFileLoading = false;
  isLoading = false;
  data = {};

  constructor() {
    makeAutoObservable(this);
  }

  setIsFileLoading = (isLoading) => {
    this.isFileLoading = isLoading;
  };

  setIsLoading = (isLoading) => {
    this.isLoading = isLoading;
  };

  toggleAccount = (id) => {
    this.checkedAccounts = this.checkedAccounts.includes(id)
      ? this.checkedAccounts.filter((itemId) => itemId !== id)
      : [...this.checkedAccounts, id];
  };

  onCheckAccounts = (checked, accounts) => {
    this.checkedAccounts = checked ? accounts.map((data) => data.id) : [];
  };

  toggleAllAccounts = (e, accounts) => {
    this.checkedAccounts = e.target.checked ? accounts.map((data) => data.key) : [];
  };

  setUsers = (data) => {
    runInAction(() => {
      this.users = data.parseResult.users;
      this.existUsers = data.parseResult.existUsers;
      this.withoutEmailUsers = data.parseResult.withoutEmailUsers;
    });
  };

  setData = (data) => {
    this.data = data.parseResult;
  };

  isAccountChecked = (id) => this.checkedAccounts.includes(id);

  cleanCheckedAccounts = () => (this.checkedAccounts = []);

  get numberOfCheckedAccounts() {
    return this.checkedAccounts.length;
  }

  multipleFileUploading = async (files, setProgress) => {
    try {
      const location = combineUrl(window.location.origin, "migrationFileUpload.ashx");
      const requestsDataArray = [];

      const res = await axios.post(location + "?Init=true");
      const chunkUploadSize = res.data.ChunkSize;

      const chunksNumber = files
        .map((file) => Math.ceil(file.size / chunkUploadSize, chunkUploadSize))
        .reduce((curr, next) => curr + next, 0);

      files.forEach((file) => {
        const chunks = Math.ceil(file.size / chunkUploadSize, chunkUploadSize);
        let chunkCounter = 0;

        while (chunkCounter < chunks) {
          const offset = chunkCounter * chunkUploadSize;
          const formData = new FormData();
          formData.append("file", file.slice(offset, offset + chunkUploadSize));
          requestsDataArray.push({ formData, fileName: file.name });
          chunkCounter++;
        }
      });

      let chunk = 0;

      console.log(requestsDataArray);

      while (chunk < chunksNumber && this.isFileLoading) {
        console.log(requestsDataArray[chunk].fileName);
        console.log(requestsDataArray[chunk].formData);
        await uploadFile(
          location + `?Name=${requestsDataArray[chunk].fileName}`,
          requestsDataArray[chunk].formData,
        );
        const progress = (chunk / chunksNumber) * 100;
        setProgress(Math.ceil(progress));
        chunk++;
      }
    } catch (e) {
      console.error(e);
    }
  };

  localFileUploading = async (file, setProgress) => {
    try {
      const location = combineUrl(window.location.origin, "migrationFileUpload.ashx");
      const requestsDataArray = [];
      let chunk = 0;

      const res = await axios.post(location + "?Init=true");
      const chunkUploadSize = res.data.ChunkSize;
      const chunks = Math.ceil(file.size / chunkUploadSize, chunkUploadSize);

      while (chunk < chunks) {
        const offset = chunk * chunkUploadSize;
        const formData = new FormData();
        formData.append("file", file.slice(offset, offset + chunkUploadSize));
        requestsDataArray.push(formData);
        chunk++;
      }

      chunk = 0;
      while (chunk < chunks && this.isFileLoading) {
        await uploadFile(location + `?Name=${file.name}`, requestsDataArray[chunk]);
        const progress = (chunk / chunks) * 100;
        setProgress(Math.ceil(progress));
        chunk++;
      }
    } catch (e) {
      console.error(e);
    }
  };

  setServices = (service) => {
    this.services = service;
  };

  getMigrationList = () => {
    return migrationList();
  };

  initMigrationName = (name) => {
    return migrationName(name);
  };

  migrationFile = (data) => {
    return migrateFile(data);
  };

  cancelMigration = () => {
    return migrationCancel();
  };

  getMigrationStatus = () => {
    return migrationStatus();
  };

  getMigrationLog = () => {
    return migrationLog();
  };
}

export default ImportAccountsStore;
