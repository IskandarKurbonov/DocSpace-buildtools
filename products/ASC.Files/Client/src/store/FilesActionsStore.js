import {
  checkFileConflicts,
  deleteFile,
  deleteFolder,
  downloadFiles,
  emptyTrash,
  finalizeVersion,
  getSubfolders,
  lockFile,
  markAsRead,
  removeFiles,
  removeShareFiles,
  createFolder,
} from "@appserver/common/api/files";
import {
  ConflictResolveType,
  FileAction,
  FileStatus,
} from "@appserver/common/constants";
import { makeAutoObservable } from "mobx";
import toastr from "studio/toastr";

import { TIMEOUT } from "../helpers/constants";
import { loopTreeFolders, checkProtocol } from "../helpers/files-helpers";
import { combineUrl } from "@appserver/common/utils";
import { AppServerConfig } from "@appserver/common/constants";
import config from "../../package.json";

class FilesActionStore {
  authStore;
  uploadDataStore;
  treeFoldersStore;
  filesStore;
  selectedFolderStore;
  settingsStore;
  dialogsStore;
  mediaViewerDataStore;

  isBulkDownload = false;

  constructor(
    authStore,
    uploadDataStore,
    treeFoldersStore,
    filesStore,
    selectedFolderStore,
    settingsStore,
    dialogsStore,
    mediaViewerDataStore
  ) {
    makeAutoObservable(this);
    this.authStore = authStore;
    this.uploadDataStore = uploadDataStore;
    this.treeFoldersStore = treeFoldersStore;
    this.filesStore = filesStore;
    this.selectedFolderStore = selectedFolderStore;
    this.settingsStore = settingsStore;
    this.dialogsStore = dialogsStore;
    this.mediaViewerDataStore = mediaViewerDataStore;
  }

  setIsBulkDownload = (isBulkDownload) => {
    this.isBulkDownload = isBulkDownload;
  };

  isMediaOpen = () => {
    const { visible, setMediaViewerData, playlist } = this.mediaViewerDataStore;
    if (visible && playlist.length === 1) {
      setMediaViewerData({ visible: false, id: null });
    }
  };

  updateCurrentFolder = (fileIds, folderIds) => {
    const {
      clearSecondaryProgressData,
    } = this.uploadDataStore.secondaryProgressDataStore;

    const {
      filter,
      fetchFiles,
      isEmptyLastPageAfterOperation,
      resetFilterPage,
    } = this.filesStore;
    let newFilter;

    const selectionFilesLength =
      fileIds && folderIds
        ? fileIds.length + folderIds.length
        : fileIds?.length || folderIds?.length;

    if (
      selectionFilesLength &&
      isEmptyLastPageAfterOperation(selectionFilesLength)
    ) {
      newFilter = resetFilterPage();
    }

    let updatedFolder = this.selectedFolderStore.id;

    if (this.dialogsStore.isFolderActions) {
      updatedFolder = this.selectedFolderStore.parentId;
    }

    fetchFiles(
      updatedFolder,
      newFilter ? newFilter : filter,
      true,
      true
    ).finally(() => {
      this.dialogsStore.setIsFolderActions(false);
      return setTimeout(() => clearSecondaryProgressData(), TIMEOUT);
    });
  };

  convertToTree = (folders) => {
    let result = [];
    let level = { result };
    try {
      folders.forEach((folder) => {
        folder.path
          .split("/")
          .filter((name) => name !== "")
          .reduce((r, name, i, a) => {
            if (!r[name]) {
              r[name] = { result: [] };
              r.result.push({ name, children: r[name].result });
            }

            return r[name];
          }, level);
      });
    } catch (e) {
      console.error("convertToTree", e);
    }
    return result;
  };

  createFolderTree = async (treeList, parentFolderId) => {
    if (!treeList || !treeList.length) return;

    for (let i = 0; i < treeList.length; i++) {
      const treeNode = treeList[i];

      // console.log(
      //   `createFolderTree parent id = ${parentFolderId} name '${treeNode.name}': `,
      //   treeNode.children
      // );

      const folder = await createFolder(parentFolderId, treeNode.name);
      const parentId = folder.id;

      if (treeNode.children.length == 0) continue;

      await this.createFolderTree(treeNode.children, parentId);
    }
  };

  uploadEmptyFolders = async (emptyFolders, folderId) => {
    //console.log("uploadEmptyFolders", emptyFolders, folderId);

    const { secondaryProgressDataStore } = this.uploadDataStore;
    const {
      setSecondaryProgressBarData,
      clearSecondaryProgressData,
    } = secondaryProgressDataStore;

    const toFolderId = folderId ? folderId : this.selectedFolderStore.id;

    setSecondaryProgressBarData({
      icon: "file",
      visible: true,
      percent: 0,
      label: "",
      alert: false,
    });

    const tree = this.convertToTree(emptyFolders);
    await this.createFolderTree(tree, toFolderId);

    this.updateCurrentFolder(null, [folderId]);

    setTimeout(() => clearSecondaryProgressData(), TIMEOUT);
  };

  deleteAction = async (
    translations,
    newSelection = null,
    withoutDialog = false
  ) => {
    const { isRecycleBinFolder, isPrivacyFolder } = this.treeFoldersStore;
    const { addActiveItems } = this.filesStore;
    const {
      secondaryProgressDataStore,
      clearActiveOperations,
    } = this.uploadDataStore;
    const {
      setSecondaryProgressBarData,
      clearSecondaryProgressData,
    } = secondaryProgressDataStore;

    const selection = newSelection ? newSelection : this.filesStore.selection;
    const isThirdPartyFile = selection.some((f) => f.providerKey);

    const currentFolderId = this.selectedFolderStore.id;

    setSecondaryProgressBarData({
      icon: "trash",
      visible: true,
      percent: 0,
      label: translations.deleteOperation,
      alert: false,
      filesCount: selection.length,
    });

    const deleteAfter = false; //Delete after finished TODO: get from settings
    const immediately = isRecycleBinFolder || isPrivacyFolder ? true : false; //Don't move to the Recycle Bin

    let folderIds = [];
    let fileIds = [];

    let i = 0;
    while (selection.length !== i) {
      if (selection[i].fileExst || selection[i].contentLength) {
        fileIds.push(selection[i].id);
      } else {
        folderIds.push(selection[i].id);
      }
      i++;
    }

    addActiveItems(fileIds);
    addActiveItems(null, folderIds);

    if (this.dialogsStore.isFolderActions && withoutDialog) {
      folderIds = [];
      fileIds = [];

      folderIds.push(selection[0]);
    }

    if (folderIds.length || fileIds.length) {
      this.isMediaOpen();

      try {
        await removeFiles(folderIds, fileIds, deleteAfter, immediately)
          .then(async (res) => {
            if (res[0]?.error) return Promise.reject(res[0].error);
            const data = res[0] ? res[0] : null;
            const pbData = {
              icon: "trash",
              label: translations.deleteOperation,
            };
            await this.uploadDataStore.loopFilesOperations(data, pbData);
            this.updateCurrentFolder(fileIds, folderIds);

            if (currentFolderId) {
              const { socketHelper } = this.authStore.settingsStore;

              socketHelper.emit({
                command: "refresh-folder",
                data: currentFolderId,
              });
            }

            if (isRecycleBinFolder) {
              return toastr.success(translations.deleteFromTrash);
            }

            if (selection.length > 1 || isThirdPartyFile) {
              return toastr.success(translations.deleteSelectedElem);
            }
            if (selection[0].fileExst) {
              return toastr.success(translations.FileRemoved);
            }
            return toastr.success(translations.FolderRemoved);
          })
          .finally(() => {
            clearActiveOperations(fileIds, folderIds);
          });
      } catch (err) {
        clearActiveOperations(fileIds, folderIds);
        setSecondaryProgressBarData({
          visible: true,
          alert: true,
        });
        setTimeout(() => clearSecondaryProgressData(), TIMEOUT);
        return toastr.error(err.message ? err.message : err);
      }
    }
  };

  emptyTrash = async (translations) => {
    const {
      secondaryProgressDataStore,
      loopFilesOperations,
      clearActiveOperations,
    } = this.uploadDataStore;
    const {
      setSecondaryProgressBarData,
      clearSecondaryProgressData,
    } = secondaryProgressDataStore;
    const { addActiveItems, files, folders } = this.filesStore;

    const fileIds = files.map((f) => f.id);
    const folderIds = folders.map((f) => f.id);
    addActiveItems(fileIds, folderIds);

    setSecondaryProgressBarData({
      icon: "trash",
      visible: true,
      percent: 0,
      label: translations.deleteOperation,
      alert: false,
    });

    try {
      await emptyTrash().then(async (res) => {
        if (res[0]?.error) return Promise.reject(res[0].error);
        const data = res[0] ? res[0] : null;
        const pbData = {
          icon: "trash",
          label: translations.deleteOperation,
        };
        await loopFilesOperations(data, pbData);
        toastr.success(translations.successOperation);
        this.updateCurrentFolder(fileIds, folderIds);
        clearActiveOperations(fileIds, folderIds);
      });
    } catch (err) {
      clearActiveOperations(fileIds, folderIds);
      setSecondaryProgressBarData({
        visible: true,
        alert: true,
      });
      setTimeout(() => clearSecondaryProgressData(), TIMEOUT);
      return toastr.error(err.message ? err.message : err);
    }
  };

  downloadFiles = async (fileConvertIds, folderIds, translations) => {
    const {
      clearActiveOperations,
      secondaryProgressDataStore,
    } = this.uploadDataStore;
    const {
      setSecondaryProgressBarData,
      clearSecondaryProgressData,
    } = secondaryProgressDataStore;

    const { addActiveItems } = this.filesStore;
    const { label } = translations;

    if (this.isBulkDownload) {
      //toastr.error(); TODO: new add cancel download operation and new translation "ErrorMassage_SecondDownload"
      return;
    }

    this.setIsBulkDownload(true);

    setSecondaryProgressBarData({
      icon: "file",
      visible: true,
      percent: 0,
      label,
      alert: false,
    });

    const fileIds = fileConvertIds.map((f) => f.key || f);
    addActiveItems(fileIds, folderIds);

    try {
      await downloadFiles(fileConvertIds, folderIds).then(async (res) => {
        const data = res[0] ? res[0] : null;
        const pbData = {
          icon: "file",
          label,
        };

        const item =
          data?.finished && data?.url
            ? data
            : await this.uploadDataStore.loopFilesOperations(
                data,
                pbData,
                true
              );

        clearActiveOperations(fileIds, folderIds);
        this.setIsBulkDownload(false);

        if (item.url) {
          window.location.href = item.url;
        } else {
          setSecondaryProgressBarData({
            visible: true,
            alert: true,
          });
        }

        setTimeout(() => clearSecondaryProgressData(), TIMEOUT);
        !item.url && toastr.error(translations.error, null, 0, true);
      });
    } catch (err) {
      this.setIsBulkDownload(false);
      clearActiveOperations(fileIds, folderIds);
      setSecondaryProgressBarData({
        visible: true,
        alert: true,
      });
      setTimeout(() => clearSecondaryProgressData(), TIMEOUT);
      return toastr.error(err.message ? err.message : err);
    }
  };

  downloadAction = (label, folderId) => {
    const { bufferSelection } = this.filesStore;

    const selection = this.filesStore.selection.length
      ? this.filesStore.selection
      : [bufferSelection];

    let fileIds = [];
    let folderIds = [];
    const items = [];

    if (selection.length === 1 && selection[0].fileExst && !folderId) {
      window.open(selection[0].viewUrl, "_self");
      return Promise.resolve();
    }

    for (let item of selection) {
      if (item.fileExst) {
        fileIds.push(item.id);
        items.push({ id: item.id, fileExst: item.fileExst });
      } else {
        folderIds.push(item.id);
        items.push({ id: item.id });
      }
    }

    if (this.dialogsStore.isFolderActions) {
      fileIds = [];
      folderIds = [];

      folderIds.push(bufferSelection);
      this.dialogsStore.setIsFolderActions(false);
    }

    return this.downloadFiles(fileIds, folderIds, label);
  };

  editCompleteAction = async (id, selectedItem, isCancelled = false) => {
    const {
      filter,
      folders,
      files,
      fileActionStore,
      fetchFiles,
      setIsLoading,
    } = this.filesStore;
    const { type, setAction } = fileActionStore;
    const { treeFolders, setTreeFolders } = this.treeFoldersStore;

    const items = [...folders, ...files];
    const item = items.find((o) => o.id === id && !o.fileExst); //TODO: maybe need files find and folders find, not at one function?
    if (type === FileAction.Create || type === FileAction.Rename) {
      setIsLoading(true);

      if (!isCancelled) {
        const data = await fetchFiles(this.selectedFolderStore.id, filter);
        const newItem = (item && item.id) === -1 ? null : item; //TODO: not add new folders?
        if (!selectedItem.fileExst && !selectedItem.contentLength) {
          const path = data.selectedFolder.pathParts;
          const folders = await getSubfolders(this.selectedFolderStore.id);
          loopTreeFolders(path, treeFolders, folders, null, newItem);
          setTreeFolders(treeFolders);
        }
      }
      setAction({
        type: null,
        id: null,
        extension: null,
        title: "",
        templateId: null,
        fromTemplate: null,
      });
      setIsLoading(false);
      type === FileAction.Rename &&
        this.onSelectItem({
          id: selectedItem.id,
          isFolder: selectedItem.isFolder,
        });
    }
  };

  onSelectItem = (
    { id, isFolder },
    withSelect = true,
    isContextItem = true
  ) => {
    const {
      setBufferSelection,
      setSelected,
      selection,
      setSelection,
      setHotkeyCaretStart,
      setHotkeyCaret,
      setEnabledHotkeys,
      filesList,
    } = this.filesStore;

    if (!id) return;

    const item = filesList.find(
      (elm) => elm.id === id && elm.isFolder === isFolder
    );

    if (item) {
      const isSelected =
        selection.findIndex((f) => f.id === id && f.isFolder === isFolder) !==
        -1;

      if (withSelect) {
        //TODO: fix double event on context-menu click
        if (isSelected && selection.length === 1 && !isContextItem) {
          setSelected("none");
        } else {
          setSelection([item]);
          setHotkeyCaret(null);
          setHotkeyCaretStart(null);
        }
      } else if (isSelected) {
        setHotkeyCaret(null);
        setHotkeyCaretStart(null);
      } else {
        setSelected("none");
        setBufferSelection(item);
      }

      isContextItem && setEnabledHotkeys(false);
    }
  };

  deleteItemAction = async (itemId, translations, isFile, isThirdParty) => {
    const {
      secondaryProgressDataStore,
      clearActiveOperations,
    } = this.uploadDataStore;
    const {
      setSecondaryProgressBarData,
      clearSecondaryProgressData,
    } = secondaryProgressDataStore;
    if (
      this.settingsStore.confirmDelete ||
      this.treeFoldersStore.isPrivacyFolder ||
      isThirdParty
    ) {
      this.dialogsStore.setDeleteDialogVisible(true);
    } else {
      setSecondaryProgressBarData({
        icon: "trash",
        visible: true,
        percent: 0,
        label: translations.deleteOperation,
        alert: false,
      });

      try {
        await this.deleteItemOperation(isFile, itemId, translations);
      } catch (err) {
        clearActiveOperations(isFile && [itemId], !isFile && [itemId]);
        setSecondaryProgressBarData({
          visible: true,
          alert: true,
        });
        setTimeout(() => clearSecondaryProgressData(), TIMEOUT);
        return toastr.error(err.message ? err.message : err);
      }
    }
  };

  deleteItemOperation = (isFile, itemId, translations) => {
    const { addActiveItems } = this.filesStore;

    const pbData = {
      icon: "trash",
      label: translations.deleteOperation,
    };

    const selectionFilesLength = 1;

    if (isFile) {
      addActiveItems([itemId]);
      this.isMediaOpen();
      return deleteFile(itemId)
        .then(async (res) => {
          if (res[0]?.error) return Promise.reject(res[0].error);
          const data = res[0] ? res[0] : null;
          await this.uploadDataStore.loopFilesOperations(data, pbData);
          this.updateCurrentFolder([itemId]);
        })
        .then(() => toastr.success(translations.successRemoveFile));
    } else {
      addActiveItems(null, [itemId]);
      return deleteFolder(itemId)
        .then(async (res) => {
          if (res[0]?.error) return Promise.reject(res[0].error);
          const data = res[0] ? res[0] : null;
          await this.uploadDataStore.loopFilesOperations(data, pbData);
          this.updateCurrentFolder(null, [itemId]);
        })
        .then(() => toastr.success(translations.successRemoveFolder));
    }
  };

  unsubscribeAction = async (fileIds, folderIds) => {
    const { setUnsubscribe } = this.dialogsStore;
    const { filter, fetchFiles } = this.filesStore;

    return removeShareFiles(fileIds, folderIds)
      .then(() => setUnsubscribe(false))
      .then(() => fetchFiles(this.selectedFolderStore.id, filter, true, true));
  };

  lockFileAction = (id, locked) => {
    const { setFile } = this.filesStore;
    return lockFile(id, locked).then((res) => setFile(res));
  };

  finalizeVersionAction = (id) => {
    const { setFile, setIsLoading } = this.filesStore;

    setIsLoading(true);

    return finalizeVersion(id, 0, false)
      .then((res) => {
        if (res && res[0]) {
          setFile(res[0]);
        }
      })
      .finally(() => setIsLoading(false));
  };

  duplicateAction = (item, label) => {
    const {
      setSecondaryProgressBarData,
      filesCount,
    } = this.uploadDataStore.secondaryProgressDataStore;

    this.setSelectedItems();

    //TODO: duplicate for folders?
    const folderIds = [];
    const fileIds = [];
    item.fileExst ? fileIds.push(item.id) : folderIds.push(item.id);
    const conflictResolveType = ConflictResolveType.Duplicate;
    const deleteAfter = false; //TODO: get from settings

    setSecondaryProgressBarData({
      icon: "duplicate",
      visible: true,
      percent: 0,
      label,
      alert: false,
      filesCount: filesCount + fileIds.length,
    });

    this.filesStore.addActiveItems(fileIds, folderIds);

    return this.uploadDataStore.copyToAction(
      this.selectedFolderStore.id,
      folderIds,
      fileIds,
      conflictResolveType,
      deleteAfter
    );
  };

  getFilesInfo = (items) => {
    const requests = [];
    let i = items.length;
    while (i !== 0) {
      requests.push(this.filesStore.getFileInfo(items[i - 1]));
      i--;
    }
    return Promise.all(requests);
  };

  setFavoriteAction = (action, id) => {
    const {
      markItemAsFavorite,
      removeItemFromFavorite,
      fetchFavoritesFolder,
      setSelected,
    } = this.filesStore;

    const items = Array.isArray(id) ? id : [id];

    switch (action) {
      case "mark":
        return markItemAsFavorite(items)
          .then(() => {
            return this.getFilesInfo(items);
          })
          .then(() => setSelected("close"));

      case "remove":
        return removeItemFromFavorite(items)
          .then(() => {
            return this.treeFoldersStore.isFavoritesFolder
              ? fetchFavoritesFolder(this.selectedFolderStore.id)
              : this.getFilesInfo(items);
          })
          .then(() => setSelected("close"));
      default:
        return;
    }
  };

  selectRowAction = (checked, file) => {
    const {
      selected,
      setSelected,
      selectFile,
      deselectFile,
      setBufferSelection,
    } = this.filesStore;
    //selected === "close" && setSelected("none");
    setBufferSelection(null);

    if (checked) {
      selectFile(file);
    } else {
      deselectFile(file);
    }
  };

  openLocationAction = (locationId) => {
    const { createNewExpandedKeys, setExpandedKeys } = this.treeFoldersStore;

    this.filesStore.setBufferSelection(null);
    return this.filesStore.fetchFiles(locationId, null).then((data) => {
      const pathParts = data.selectedFolder.pathParts;
      const newExpandedKeys = createNewExpandedKeys(pathParts);
      setExpandedKeys(newExpandedKeys);
    });
  };

  setThirdpartyInfo = (providerKey) => {
    const { setConnectDialogVisible, setConnectItem } = this.dialogsStore;
    const { providers, capabilities } = this.settingsStore.thirdPartyStore;
    const provider = providers.find((x) => x.provider_key === providerKey);
    const capabilityItem = capabilities.find((x) => x[0] === providerKey);
    const capability = {
      title: capabilityItem ? capabilityItem[0] : provider.customer_title,
      link: capabilityItem ? capabilityItem[1] : " ",
    };

    setConnectDialogVisible(true);
    setConnectItem({ ...provider, ...capability });
  };

  setNewBadgeCount = (item) => {
    const { getRootFolder, updateRootBadge } = this.treeFoldersStore;
    const { updateFileBadge, updateFolderBadge } = this.filesStore;
    const { rootFolderType, fileExst, id } = item;

    const count = item.new ? item.new : 1;
    const rootFolder = getRootFolder(rootFolderType);
    updateRootBadge(rootFolder.id, count);

    if (fileExst) updateFileBadge(id);
    else updateFolderBadge(id, item.new);
  };

  markAsRead = (folderIds, fileIds, item) => {
    const {
      setSecondaryProgressBarData,
      clearSecondaryProgressData,
    } = this.uploadDataStore.secondaryProgressDataStore;

    setSecondaryProgressBarData({
      icon: "file",
      label: "", //TODO: add translation if need "MarkAsRead": "Mark all as read",
      percent: 0,
      visible: true,
    });

    return markAsRead(folderIds, fileIds)
      .then(async (res) => {
        const data = res[0] ? res[0] : null;
        const pbData = { icon: "file" };
        await this.uploadDataStore.loopFilesOperations(data, pbData);
      })
      .then(() => {
        if (!item) return;

        this.setNewBadgeCount(item);

        const { getFileIndex, updateFileStatus } = this.filesStore;

        const index = getFileIndex(item.id);
        updateFileStatus(index, item.fileStatus & ~FileStatus.IsNew);
      })
      .catch((err) => toastr.error(err))
      .finally(() => setTimeout(() => clearSecondaryProgressData(), TIMEOUT));
  };

  moveDragItems = (destFolderId, folderTitle, providerKey, translations) => {
    const folderIds = [];
    const fileIds = [];
    const deleteAfter = false;

    const { selection } = this.filesStore;
    const { isRootFolder } = this.selectedFolderStore;
    const {
      isShareFolder,
      isCommonFolder,
      isFavoritesFolder,
      isRecentFolder,
    } = this.treeFoldersStore;
    const isCopy =
      isShareFolder ||
      isFavoritesFolder ||
      isRecentFolder ||
      (!this.authStore.isAdmin && isCommonFolder);

    const operationData = {
      destFolderId,
      folderIds,
      fileIds,
      deleteAfter,
      translations,
      folderTitle,
      isCopy,
    };

    const {
      setThirdPartyMoveDialogVisible,
      setDestFolderId,
    } = this.dialogsStore;

    const provider = selection.find((x) => x.providerKey);

    if (provider && providerKey !== provider.providerKey) {
      setDestFolderId(destFolderId);
      return setThirdPartyMoveDialogVisible(true);
    }

    for (let item of selection) {
      if (!item.isFolder) {
        fileIds.push(item.id);
      } else {
        if (item.providerKey && isRootFolder) continue;
        folderIds.push(item.id);
      }
    }

    if (!folderIds.length && !fileIds.length) return;
    this.checkOperationConflict(operationData);
  };

  checkFileConflicts = (destFolderId, folderIds, fileIds) => {
    this.filesStore.addActiveItems(fileIds);
    this.filesStore.addActiveItems(null, folderIds);
    return checkFileConflicts(destFolderId, folderIds, fileIds);
  };

  setConflictDialogData = (conflicts, operationData) => {
    this.dialogsStore.setConflictResolveDialogItems(conflicts);
    this.dialogsStore.setConflictResolveDialogData(operationData);
    this.dialogsStore.setConflictResolveDialogVisible(true);
  };

  setSelectedItems = () => {
    const selectionLength = this.filesStore.selection.length;
    const selectionTitle = this.filesStore.selectionTitle;

    if (selectionLength !== undefined && selectionTitle) {
      this.uploadDataStore.secondaryProgressDataStore.setItemsSelectionLength(
        selectionLength
      );
      this.uploadDataStore.secondaryProgressDataStore.setItemsSelectionTitle(
        selectionTitle
      );
    }
  };

  checkOperationConflict = async (operationData) => {
    const { destFolderId, folderIds, fileIds } = operationData;
    const { setBufferSelection } = this.filesStore;

    this.setSelectedItems();

    this.filesStore.setSelected("none");
    let conflicts;

    try {
      conflicts = await this.checkFileConflicts(
        destFolderId,
        folderIds,
        fileIds
      );
    } catch (err) {
      setBufferSelection(null);
      return toastr.error(err.message ? err.message : err);
    }

    if (conflicts.length) {
      this.setConflictDialogData(conflicts, operationData);
    } else {
      try {
        await this.uploadDataStore.itemOperationToFolder(operationData);
      } catch (err) {
        setBufferSelection(null);
        return toastr.error(err.message ? err.message : err);
      }
    }
  };

  isAvailableOption = (option) => {
    const {
      isFavoritesFolder,
      isRecentFolder,
      isCommonFolder,
    } = this.treeFoldersStore;
    const {
      isAccessedSelected,
      canConvertSelected,
      isThirdPartyRootSelection,
      hasSelection,
      allFilesIsEditing,
    } = this.filesStore;
    const { personal } = this.authStore.settingsStore;
    const { userAccess } = this.filesStore;

    switch (option) {
      case "share":
        return isAccessedSelected && !personal; //isFavoritesFolder ||isRecentFolder
      case "showInfo":
      case "copy":
      case "download":
        return hasSelection;
      case "downloadAs":
        return canConvertSelected;
      case "moveTo":
        return (
          !isThirdPartyRootSelection &&
          hasSelection &&
          isAccessedSelected &&
          !isRecentFolder &&
          !isFavoritesFolder &&
          !allFilesIsEditing
        );

      case "delete":
        const deleteCondition =
          !isThirdPartyRootSelection &&
          hasSelection &&
          isAccessedSelected &&
          !allFilesIsEditing;

        return isCommonFolder ? userAccess && deleteCondition : deleteCondition;
    }
  };

  convertToArray = (itemsCollection) => {
    const result = Array.from(itemsCollection.values()).filter((item) => {
      return item != null;
    });

    itemsCollection.clear();

    return result;
  };

  getOption = (option, t) => {
    const {
      setSharingPanelVisible,
      setDownloadDialogVisible,
      setMoveToPanelVisible,
      setCopyPanelVisible,
      setDeleteDialogVisible,
    } = this.dialogsStore;

    switch (option) {
      case "share":
        if (!this.isAvailableOption("share")) return null;
        else
          return {
            label: t("Share"),
            onClick: () => setSharingPanelVisible(true),
            iconUrl: "/static/images/share.react.svg",
            title: t("Translations:ButtonShareAccess"),
          };

      case "copy":
        if (!this.isAvailableOption("copy")) return null;
        else
          return {
            label: t("Translations:Copy"),
            onClick: () => setCopyPanelVisible(true),
            iconUrl: "/static/images/copyTo.react.svg",
          };

      case "download":
        if (!this.isAvailableOption("download")) return null;
        else
          return {
            label: t("Common:Download"),
            onClick: () =>
              this.downloadAction(
                t("Translations:ArchivingData")
              ).catch((err) => toastr.error(err)),
            iconUrl: "/static/images/download.react.svg",
          };

      case "downloadAs":
        if (!this.isAvailableOption("downloadAs")) return null;
        else
          return {
            label: t("Translations:DownloadAs"),
            onClick: () => setDownloadDialogVisible(true),
            iconUrl: "/static/images/downloadAs.react.svg",
          };

      case "moveTo":
        if (!this.isAvailableOption("moveTo")) return null;
        else
          return {
            label: t("MoveTo"),
            onClick: () => setMoveToPanelVisible(true),
            iconUrl: "/static/images/move.react.svg",
          };

      case "delete":
        if (!this.isAvailableOption("delete")) return null;
        else
          return {
            label: t("Common:Delete"),
            onClick: () => {
              if (this.settingsStore.confirmDelete) {
                setDeleteDialogVisible(true);
              } else {
                const translations = {
                  deleteOperation: t("Translations:DeleteOperation"),
                  deleteFromTrash: t("Translations:DeleteFromTrash"),
                  deleteSelectedElem: t("Translations:DeleteSelectedElem"),
                  FileRemoved: t("Home:FileRemoved"),
                  FolderRemoved: t("Home:FolderRemoved"),
                };

                this.deleteAction(translations).catch((err) =>
                  toastr.error(err)
                );
              }
            },
            iconUrl: "/static/images/delete.react.svg",
          };
    }
  };

  getAnotherFolderOptions = (itemsCollection, t) => {
    const share = this.getOption("share", t);
    const download = this.getOption("download", t);
    const downloadAs = this.getOption("downloadAs", t);
    const moveTo = this.getOption("moveTo", t);
    const copy = this.getOption("copy", t);
    const deleteOption = this.getOption("delete", t);
    const showInfo = this.getOption("showInfo", t);

    itemsCollection
      .set("share", share)
      .set("download", download)
      .set("downloadAs", downloadAs)
      .set("moveTo", moveTo)
      .set("copy", copy)
      .set("delete", deleteOption)
      .set("showInfo", showInfo);

    return this.convertToArray(itemsCollection);
  };

  getRecentFolderOptions = (itemsCollection, t) => {
    const share = this.getOption("share", t);
    const download = this.getOption("download", t);
    const downloadAs = this.getOption("downloadAs", t);
    const copy = this.getOption("copy", t);
    const showInfo = this.getOption("showInfo", t);

    itemsCollection
      .set("share", share)
      .set("download", download)
      .set("downloadAs", downloadAs)
      .set("copy", copy)
      .set("showInfo", showInfo);

    return this.convertToArray(itemsCollection);
  };

  getShareFolderOptions = (itemsCollection, t) => {
    const { setDeleteDialogVisible, setUnsubscribe } = this.dialogsStore;

    const share = this.getOption("share", t);
    const download = this.getOption("download", t);
    const downloadAs = this.getOption("downloadAs", t);
    const copy = this.getOption("copy", t);
    const showInfo = this.getOption("showInfo", t);

    itemsCollection
      .set("share", share)
      .set("download", download)
      .set("downloadAs", downloadAs)
      .set("copy", copy)
      .set("delete", {
        label: t("RemoveFromList"),
        onClick: () => {
          setUnsubscribe(true);
          setDeleteDialogVisible(true);
        },
      })
      .set("showInfo", showInfo);

    return this.convertToArray(itemsCollection);
  };

  getPrivacyFolderOption = (itemsCollection, t) => {
    const moveTo = this.getOption("moveTo", t);
    const deleteOption = this.getOption("delete", t);
    const download = this.getOption("download", t);
    const showInfo = this.getOption("showInfo", t);

    itemsCollection
      .set("download", download)
      .set("moveTo", moveTo)

      .set("delete", deleteOption)
      .set("showInfo", showInfo);

    return this.convertToArray(itemsCollection);
  };

  getFavoritesFolderOptions = (itemsCollection, t) => {
    const { selection } = this.filesStore;

    const share = this.getOption("share", t);
    const download = this.getOption("download", t);
    const downloadAs = this.getOption("downloadAs", t);
    const copy = this.getOption("copy", t);
    const showInfo = this.getOption("showInfo", t);

    itemsCollection
      .set("share", share)
      .set("download", download)
      .set("downloadAs", downloadAs)
      .set("copy", copy)
      .set("delete", {
        label: t("RemoveFromFavorites"),
        alt: t("RemoveFromFavorites"),
        iconUrl: "/static/images/delete.react.svg",
        onClick: () => {
          const items = selection.map((item) => item.id);
          this.setFavoriteAction("remove", items)
            .then(() => toastr.success(t("RemovedFromFavorites")))
            .catch((err) => toastr.error(err));
        },
      })
      .set("showInfo", showInfo);

    return this.convertToArray(itemsCollection);
  };

  getRecycleBinFolderOptions = (itemsCollection, t) => {
    const {
      setEmptyTrashDialogVisible,
      setMoveToPanelVisible,
    } = this.dialogsStore;

    const download = this.getOption("download", t);
    const downloadAs = this.getOption("downloadAs", t);
    const deleteOption = this.getOption("delete", t);
    const showInfo = this.getOption("showInfo", t);

    itemsCollection
      .set("download", download)
      .set("downloadAs", downloadAs)
      .set("restore", {
        label: t("Common:Restore"),
        onClick: () => setMoveToPanelVisible(true),
        iconUrl: "/static/images/move.react.svg",
      })
      .set("delete", deleteOption)
      .set("showInfo", showInfo);

    return this.convertToArray(itemsCollection);
  };

  getHeaderMenu = (t) => {
    const {
      isFavoritesFolder,
      isRecentFolder,
      isRecycleBinFolder,
      isPrivacyFolder,
      isShareFolder,
    } = this.treeFoldersStore;

    let itemsCollection = new Map();

    if (isRecycleBinFolder)
      return this.getRecycleBinFolderOptions(itemsCollection, t);

    if (isFavoritesFolder)
      return this.getFavoritesFolderOptions(itemsCollection, t);

    if (isPrivacyFolder) return this.getPrivacyFolderOption(itemsCollection, t);

    if (isShareFolder) return this.getShareFolderOptions(itemsCollection, t);

    if (isRecentFolder) return this.getRecentFolderOptions(itemsCollection, t);

    return this.getAnotherFolderOptions(itemsCollection, t);
  };

  onMarkAsRead = (item) => this.markAsRead([], [`${item.id}`], item);

  openFileAction = (item) => {
    const {
      isLoading,
      setIsLoading,
      fetchFiles,
      openDocEditor,
      isPrivacyFolder,
    } = this.filesStore;
    const {
      isRecycleBinFolder,
      setExpandedKeys,
      createNewExpandedKeys,
    } = this.treeFoldersStore;
    const { setMediaViewerData } = this.mediaViewerDataStore;
    const { setConvertDialogVisible, setConvertItem } = this.dialogsStore;

    const isMediaOrImage = this.settingsStore.isMediaOrImage(item.fileExst);
    const canConvert = this.settingsStore.canConvert(item.fileExst);
    const canWebEdit = this.settingsStore.canWebEdit(item.fileExst);
    const canViewedDocs = this.settingsStore.canViewedDocs(item.fileExst);

    const { id, viewUrl, providerKey, fileStatus, encrypted, isFolder } = item;
    if (encrypted && isPrivacyFolder) return checkProtocol(item.id, true);

    if (isRecycleBinFolder || isLoading) return;

    if (isFolder) {
      setIsLoading(true);
      //addExpandedKeys(parentFolder + "");

      fetchFiles(id, null, true, false)
        .then((data) => {
          const pathParts = data.selectedFolder.pathParts;
          const newExpandedKeys = createNewExpandedKeys(pathParts);
          setExpandedKeys(newExpandedKeys);
        })
        .catch((err) => {
          toastr.error(err);
          setIsLoading(false);
        })
        .finally(() => setIsLoading(false));
    } else {
      if (canConvert) {
        setConvertItem(item);
        setConvertDialogVisible(true);
        return;
      }

      if ((fileStatus & FileStatus.IsNew) === FileStatus.IsNew)
        this.onMarkAsRead(item);

      if (canWebEdit || canViewedDocs) {
        let tab =
          !this.authStore.settingsStore.isDesktopClient && !isFolder
            ? window.open(
                combineUrl(
                  AppServerConfig.proxyURL,
                  config.homepage,
                  "/doceditor"
                ),
                "_blank"
              )
            : null;

        return openDocEditor(id, providerKey, tab);
      }

      if (isMediaOrImage) {
        localStorage.setItem("isFirstUrl", window.location.href);
        setMediaViewerData({ visible: true, id });

        const url = "/products/files/#preview/" + id;
        history.pushState(null, null, url);
        return;
      }

      return window.open(viewUrl, "_self");
    }
  };

  backToParentFolder = () => {
    const { setIsLoading, fetchFiles } = this.filesStore;

    if (!this.selectedFolderStore.parentId) return;

    setIsLoading(true);

    fetchFiles(
      this.selectedFolderStore.parentId,
      null,
      true,
      false
    ).finally(() => setIsLoading(false));
  };
}

export default FilesActionStore;
