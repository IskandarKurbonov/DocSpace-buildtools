import React from "react";
import { ReactSVG } from "react-svg";
import styled from "styled-components";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import IconButton from "@appserver/components/icon-button";
import Text from "@appserver/components/text";
import DragAndDrop from "@appserver/components/drag-and-drop";
import Row from "@appserver/components/row";
import FilesRowContent from "./FilesRowContent";
import history from "@appserver/common/history";
import toastr from "@appserver/components/toast";
import { FileAction } from "@appserver/common/constants";

const StyledSimpleFilesRow = styled(Row)`
  margin-top: -2px;
  ${(props) =>
    !props.contextOptions &&
    `
    & > div:last-child {
        width: 0px;
      }
  `}

  .share-button-icon {
    margin-right: 7px;
    margin-top: -1px;
  }

  .share-button:hover,
  .share-button-icon:hover {
    cursor: pointer;
    color: #657077;
    path {
      fill: #657077;
    }
  }
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

  @media (max-width: 1312px) {
    .share-button {
      padding-top: 3px;
    }
  }

  .styled-element {
    margin-right: 1px;
    margin-bottom: 2px;
  }
`;

const EncryptedFileIcon = styled.div`
  background: url("images/security.svg") no-repeat 0 0 / 16px 16px transparent;
  height: 16px;
  position: absolute;
  width: 16px;
  margin-top: 14px;
  margin-left: ${(props) => (props.isEdit ? "40px" : "12px")};
`;

const svgLoader = () => <div style={{ width: "24px" }}></div>;

const SimpleFilesRow = (props) => {
  const {
    t,
    item,
    sectionWidth,
    actionType,
    actionExtension,
    isPrivacy,
    isRecycleBin,
    dragging,
    //selected,
    //setSelected,
    checked,
    canShare,
    isFolder,
    draggable,
    isRootFolder,
    //setSelection,
    homepage,
    isTabletView,
    actionId,

    setSharingPanelVisible,
    setChangeOwnerPanelVisible,
    showDeleteThirdPartyDialog,
    setRemoveItem,
    setMoveToPanelVisible,
    setCopyPanelVisible,
    openDocEditor,
    setIsLoading,
    setIsVerHistoryPanel,
    setVerHistoryFileId,
    setAction,
    deleteFileAction,
    deleteFolderAction,
    lockFileAction,
    duplicateAction,
    finalizeVersionAction,
    setFavoriteAction,
    openLocationAction,
    selectRowAction,
    setThirdpartyInfo,
    setMediaViewerData,
  } = props;

  const {
    id,
    title,
    fileExst,
    shared,
    access,
    value,
    contextOptions,
    icon,
    providerKey,
    folderId,
    viewUrl,
    webUrl,
    canOpenPlayer,
    locked,
  } = item;

  const isThirdPartyFolder = providerKey && isRootFolder;

  const onContentRowSelect = (checked, file) => {
    if (!file) return;

    selectRowAction(checked, file);
  };

  const onClickShare = () => setSharingPanelVisible(true);
  const onOwnerChange = () => setChangeOwnerPanelVisible(true);
  const onMoveAction = () => setMoveToPanelVisible(true);
  const onCopyAction = () => setCopyPanelVisible(true);

  const getSharedButton = (shared) => {
    const color = shared ? "#657077" : "#a3a9ae";
    return (
      <Text
        className="share-button"
        as="span"
        title={t("Share")}
        fontSize="12px"
        fontWeight={600}
        color={color}
        display="inline-flex"
        onClick={onClickShare}
      >
        <IconButton
          className="share-button-icon"
          color={color}
          hoverColor="#657077"
          size={18}
          iconName="images/catalog.shared.react.svg"
        />
        {t("Share")}
      </Text>
    );
  };

  const getItemIcon = (isEdit) => {
    return (
      <>
        <ReactSVG
          beforeInjection={(svg) => {
            svg.setAttribute("style", "margin-top: 4px");
            isEdit && svg.setAttribute("style", "margin: 4px 0 0 28px");
          }}
          src={icon}
          loading={svgLoader}
        />
        {isPrivacy && fileExst && <EncryptedFileIcon isEdit={isEdit} />}
      </>
    );
  };

  const onOpenLocation = () => {
    const locationId = isFolder ? id : folderId;
    openLocationAction(locationId, isFolder);
  };

  const showVersionHistory = () => {
    if (!isTabletView) {
      setIsLoading(true);
      setVerHistoryFileId(id);
      setIsVerHistoryPanel(true);
    } else {
      history.push(`${homepage}/${id}/history`);
    }
  };

  const finalizeVersion = () => finalizeVersionAction(id);

  const onClickFavorite = (e) => {
    const { action } = e.currentTarget.dataset;
    setFavoriteAction(action, id);
  };

  const lockFile = () => lockFileAction(id, locked);

  const onClickLinkForPortal = () => {
    const isFile = !!fileExst;
    const { t } = this.props;
    copy(
      isFile
        ? canOpenPlayer
          ? `${window.location.href}&preview=${id}`
          : webUrl
        : `${window.location.origin + homepage}/filter?folder=${id}`
    );

    toastr.success(t("LinkCopySuccess"));
  };

  const onClickLinkEdit = () => openDocEditor(id, providerKey);

  const onClickDownload = () => window.open(viewUrl, "_blank");

  const onDuplicate = () => duplicateAction(item, t("CopyOperation"));

  const onClickRename = () => {
    setAction({
      type: FileAction.Rename,
      extension: fileExst,
      id,
    });
  };

  const onChangeThirdPartyInfo = () => setThirdpartyInfo();

  const onMediaFileClick = (fileId) => {
    const itemId = typeof fileId !== "object" ? fileId : id;
    setMediaViewerData({ visible: true, id: itemId });
  };

  const onClickDelete = () => {
    if (isThirdPartyFolder) {
      const splitItem = id.split("-");
      setRemoveItem({ id: splitItem[splitItem.length - 1], title });
      showDeleteThirdPartyDialog(true);
      return;
    }

    const translations = {
      deleteOperation: t("DeleteOperation"),
      folderRemoved: t("FolderRemoved"),
      fileRemoved: t("FileRemoved"),
    };

    item.fileExst
      ? deleteFileAction(item.id, item.folderId, translations)
      : deleteFolderAction(item.id, item.parentId, translations);
  };

  const getFilesContextOptions = (options, item) => {
    const isSharable = item.access !== 1 && item.access !== 0;

    return options.map((option) => {
      switch (option) {
        case "open":
          return {
            key: option,
            label: t("Open"),
            icon: "CatalogFolderIcon",
            onClick: onOpenLocation,
            disabled: false,
          };
        case "show-version-history":
          return {
            key: option,
            label: t("ShowVersionHistory"),
            icon: "HistoryIcon",
            onClick: showVersionHistory,
            disabled: false,
          };
        case "finalize-version":
          return {
            key: option,
            label: t("FinalizeVersion"),
            icon: "HistoryFinalizedIcon",
            onClick: finalizeVersion,
            disabled: false,
          };
        case "separator0":
        case "separator1":
        case "separator2":
        case "separator3":
          return { key: option, isSeparator: true };
        case "open-location":
          return {
            key: option,
            label: t("OpenLocation"),
            icon: "DownloadAsIcon",
            onClick: onOpenLocation,
            disabled: false,
          };
        case "mark-as-favorite":
          return {
            key: option,
            label: t("MarkAsFavorite"),
            icon: "FavoritesIcon",
            onClick: onClickFavorite,
            disabled: false,
            "data-action": "mark",
          };
        case "block-unblock-version":
          return {
            key: option,
            label: t("UnblockVersion"),
            icon: "LockIcon",
            onClick: lockFile,
            disabled: false,
          };
        case "sharing-settings":
          return {
            key: option,
            label: t("SharingSettings"),
            icon: "CatalogSharedIcon",
            onClick: onClickShare,
            disabled: isSharable,
          };
        case "send-by-email":
          return {
            key: option,
            label: t("SendByEmail"),
            icon: "MailIcon",
            disabled: true,
          };
        case "owner-change":
          return {
            key: option,
            label: t("ChangeOwner"),
            icon: "CatalogUserIcon",
            onClick: onOwnerChange,
            disabled: false,
          };
        case "link-for-portal-users":
          return {
            key: option,
            label: t("LinkForPortalUsers"),
            icon: "InvitationLinkIcon",
            onClick: onClickLinkForPortal,
            disabled: false,
          };
        case "edit":
          return {
            key: option,
            label: t("Edit"),
            icon: "AccessEditIcon",
            onClick: onClickLinkEdit,
            disabled: false,
          };
        case "preview":
          return {
            key: option,
            label: t("Preview"),
            icon: "EyeIcon",
            onClick: onClickLinkEdit,
            disabled: true,
          };
        case "view":
          return {
            key: option,
            label: t("View"),
            icon: "EyeIcon",
            onClick: onMediaFileClick,
            disabled: false,
          };
        case "download":
          return {
            key: option,
            label: t("Download"),
            icon: "DownloadIcon",
            onClick: onClickDownload,
            disabled: false,
          };
        case "move":
          return {
            key: option,
            label: t("MoveTo"),
            icon: "MoveToIcon",
            onClick: onMoveAction,
            disabled: false,
          };
        case "copy":
          return {
            key: option,
            label: t("Copy"),
            icon: "CopyIcon",
            onClick: onCopyAction,
            disabled: false,
          };
        case "duplicate":
          return {
            key: option,
            label: t("Duplicate"),
            icon: "CopyIcon",
            onClick: onDuplicate,
            disabled: false,
          };
        case "rename":
          return {
            key: option,
            label: t("Rename"),
            icon: "RenameIcon",
            onClick: onClickRename,
            disabled: false,
          };
        case "change-thirdparty-info":
          return {
            key: option,
            label: t("ThirdPartyInfo"),
            icon: "AccessEditIcon",
            onClick: onChangeThirdPartyInfo,
            disabled: false,
          };
        case "delete":
          return {
            key: option,
            label: isThirdPartyFolder ? t("DeleteThirdParty") : t("Delete"),
            icon: "CatalogTrashIcon",
            onClick: onClickDelete,
            disabled: false,
          };
        case "remove-from-favorites":
          return {
            key: option,
            label: t("RemoveFromFavorites"),
            icon: "FavoritesIcon",
            onClick: onClickFavorite,
            disabled: false,
            "data-action": "remove",
          };
        default:
          break;
      }

      return undefined;
    });
  };

  // const onSelectItem = () => {
  //   selected === "close" && setSelected("none");
  //   setSelection([item]);
  // };

  const isMobile = sectionWidth < 500;

  const isEdit =
    !!actionType && actionId === id && fileExst === actionExtension;

  const contextOptionsProps =
    !isEdit && contextOptions && contextOptions.length > 0
      ? {
          contextOptions: getFilesContextOptions(contextOptions, item),
        }
      : {};

  const checkedProps = isEdit || id <= 0 ? {} : { checked };

  const element = getItemIcon(isEdit || id <= 0);

  const sharedButton =
    !canShare || (isPrivacy && !fileExst) || isEdit || id <= 0 || isMobile
      ? null
      : getSharedButton(shared);

  const displayShareButton = isMobile ? "26px" : !canShare ? "38px" : "96px";

  let className = isFolder && access < 2 && !isRecycleBin ? " dropable" : "";
  if (draggable) className += " draggable";

  return (
    <DragAndDrop
      className={className}
      //onDrop={this.onDrop.bind(this, item)}
      //onMouseDown={this.onMouseDown}
      dragging={dragging && isFolder && access < 2}
      {...contextOptionsProps}
      value={value}
      //{...props}
    >
      <StyledSimpleFilesRow
        sectionWidth={sectionWidth}
        key={id}
        data={item}
        element={element}
        contentElement={sharedButton}
        onSelect={onContentRowSelect}
        isPrivacy={isPrivacy}
        {...checkedProps}
        {...contextOptionsProps}
        //needForUpdate={this.needForUpdate}
        //selectItem={onSelectItem}
        contextButtonSpacerWidth={displayShareButton}
      >
        <FilesRowContent item={item} sectionWidth={sectionWidth} />
      </StyledSimpleFilesRow>
    </DragAndDrop>
  );
};

export default inject(
  (
    {
      auth,
      initFilesStore,
      filesStore,
      treeFoldersStore,
      selectedFolderStore,
      dialogsStore,
      versionHistoryStore,
      filesActionsStore,
      mediaViewerDataStore,
    },
    { item }
  ) => {
    const { homepage, isTabletView } = auth.settingsStore;
    const { dragging, setIsLoading } = initFilesStore;
    const { type, extension, id } = filesStore.fileActionStore;
    const { isRecycleBinFolder, isPrivacyFolder } = treeFoldersStore;

    const {
      setSharingPanelVisible,
      setChangeOwnerPanelVisible,
      setRemoveItem,
      showDeleteThirdPartyDialog,
      setMoveToPanelVisible,
      setCopyPanelVisible,
    } = dialogsStore;

    const {
      //selected,
      //setSelected,
      selection,
      canShare,
      //setSelection,
      openDocEditor,
      fileActionStore,
    } = filesStore;

    const { isRootFolder } = selectedFolderStore;
    const { setIsVerHistoryPanel, setVerHistoryFileId } = versionHistoryStore;
    const { setAction } = fileActionStore;

    const selectedItem = selection.find(
      (x) => x.id === item.id && x.fileExst === item.fileExst
    );

    const isFolder = selectedItem ? false : item.fileExst ? false : true;
    const draggable =
      selectedItem && isRecycleBinFolder && selectedItem.id !== id;

    const {
      deleteFileAction,
      deleteFolderAction,
      lockFileAction,
      finalizeVersionAction,
      duplicateAction,
      setFavoriteAction,
      openLocationAction,
      selectRowAction,
      setThirdpartyInfo,
    } = filesActionsStore;

    const { setMediaViewerData } = mediaViewerDataStore;

    return {
      dragging,
      actionType: type,
      actionExtension: extension,
      isPrivacy: isPrivacyFolder,
      isRecycleBin: isRecycleBinFolder,
      isRootFolder,
      canShare,
      //selected,
      //setSelected,
      //setSelection,
      checked: selection.some((el) => el.id === item.id),
      isFolder,
      draggable,
      homepage,
      isTabletView,
      actionId: fileActionStore.id,
      setSharingPanelVisible,
      setChangeOwnerPanelVisible,
      setRemoveItem,
      showDeleteThirdPartyDialog,
      setMoveToPanelVisible,
      setCopyPanelVisible,
      openDocEditor,
      setIsLoading,
      setIsVerHistoryPanel,
      setVerHistoryFileId,
      setAction,
      deleteFileAction,
      deleteFolderAction,
      lockFileAction,
      finalizeVersionAction,
      duplicateAction,
      setFavoriteAction,
      openLocationAction,
      selectRowAction,
      setThirdpartyInfo,
      setMediaViewerData,
    };
  }
)(withTranslation("Home")(observer(SimpleFilesRow)));

// onDrop = (item, items, e) => {
//   const { onDropZoneUpload, selectedFolderId } = this.props;

//   if (!item.fileExst) {
//     onDropZoneUpload(items, item.id);
//   } else {
//     onDropZoneUpload(items, selectedFolderId);
//   }
// };
