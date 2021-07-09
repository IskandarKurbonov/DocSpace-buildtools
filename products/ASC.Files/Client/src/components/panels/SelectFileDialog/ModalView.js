import React from "react";
import { inject, observer, Provider as MobxProvider } from "mobx-react";
import PropTypes from "prop-types";
import stores from "../../../store/index";
import { StyledAsidePanel, StyledSelectFilePanel } from "../StyledPanels";
import ModalDialog from "@appserver/components/modal-dialog";
import SelectFolderDialog from "../SelectFolderDialog";
import FolderTreeBody from "../../FolderTreeBody";
import FilesListBody from "./FilesListBody";
import Button from "@appserver/components/button";
import Loader from "@appserver/components/loader";
import Text from "@appserver/components/text";
import { isArrayEqual } from "@appserver/components/utils/array";

class SelectFileDialogModalViewBody extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
    };
    this.folderList = "";
  }

  componentDidMount() {
    const {
      foldersType,
      onSetLoadingData,
      onSelectFolder,
      selectedFolder,
      passedId,
    } = this.props;

    switch (foldersType) {
      case "common":
        this.setState({ isLoading: true }, function () {
          onSetLoadingData && onSetLoadingData(true);
          SelectFolderDialog.getCommonFolders()
            .then((commonFolder) => {
              this.folderList = commonFolder;
            })
            .then(
              () =>
                !selectedFolder &&
                onSelectFolder &&
                onSelectFolder(
                  `${
                    selectedFolder
                      ? selectedFolder
                      : passedId
                      ? passedId
                      : this.folderList[0].id
                  }`
                )
            )
            .finally(() => {
              onSetLoadingData && onSetLoadingData(false);

              this.setState({
                isLoading: false,
              });
            });
        });

        break;
      case "third-party":
        this.setState({ isLoading: true }, function () {
          onSetLoadingData && onSetLoadingData(true);
          SelectFolderDialog.getCommonThirdPartyList()
            .then(
              (commonThirdPartyArray) =>
                (this.folderList = commonThirdPartyArray)
            )
            .then(
              () =>
                onSelectFolder &&
                onSelectFolder(
                  `${
                    selectedFolder
                      ? selectedFolder
                      : passedId
                      ? passedId
                      : this.folderList[0].id
                  }`
                )
            )
            .finally(() => {
              onSetLoadingData && onSetLoadingData(false);

              this.setState({
                isLoading: false,
              });
            });
        });
        break;
    }
  }

  onSelect = (folder) => {
    const { onSelectFolder, selectedKeys } = this.props;

    if (isArrayEqual(folder, selectedKeys)) {
      return;
    }

    onSelectFolder && onSelectFolder(folder[0]);
  };
  render() {
    const {
      t,
      isPanelVisible,
      onClose,
      zIndex,
      withoutProvider,
      expandedKeys,
      filter,
      onSelectFile,
      filesList,
      hasNextPage,
      isNextPageLoading,
      loadNextPage,
      selectedFolder,
      header,
      loadingText,
      selectedFile,
      onClickSave,
      children,
    } = this.props;

    const { isLoading } = this.state;

    const isHeaderChildren = !!children;

    return (
      <StyledAsidePanel visible={isPanelVisible}>
        <ModalDialog
          visible={isPanelVisible}
          zIndex={zIndex}
          onClose={onClose}
          className="select-file-modal-dialog"
          style={{ maxWidth: "890px" }}
          displayType="modal"
          bodyPadding="0"
        >
          <ModalDialog.Header>
            {header ? header : t("SelectFile")}
          </ModalDialog.Header>
          <ModalDialog.Body className="select-file_body-modal-dialog">
            <StyledSelectFilePanel isHeaderChildren={isHeaderChildren}>
              {!isLoading ? (
                <div className="modal-dialog_body">
                  <div className="modal-dialog_children">{children}</div>
                  <div className="modal-dialog_tree-body">
                    <FolderTreeBody
                      expandedKeys={expandedKeys}
                      folderList={this.folderList}
                      onSelect={this.onSelect}
                      withoutProvider={withoutProvider}
                      certainFolders
                      isAvailableFolders
                      filter={filter}
                      selectedKeys={[selectedFolder]}
                      isHeaderChildren={isHeaderChildren}
                    />
                  </div>
                  <div className="modal-dialog_files-body">
                    {selectedFolder && (
                      <FilesListBody
                        filesList={filesList}
                        onSelectFile={onSelectFile}
                        hasNextPage={hasNextPage}
                        isNextPageLoading={isNextPageLoading}
                        loadNextPage={loadNextPage}
                        selectedFolder={selectedFolder}
                        loadingText={loadingText}
                        selectedFile={selectedFile}
                        listHeight={isHeaderChildren ? 250 : 300}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div
                  key="loader"
                  className="select-file-dialog_modal-loader panel-loader-wrapper"
                >
                  <Loader type="oval" size="16px" className="panel-loader" />
                  <Text as="span">{`${t("Common:LoadingProcessing")} ${t(
                    "Common:LoadingDescription"
                  )}`}</Text>
                </div>
              )}
            </StyledSelectFilePanel>
          </ModalDialog.Body>
          <ModalDialog.Footer>
            <StyledSelectFilePanel>
              <div className="select-file-dialog-modal_buttons">
                <Button
                  className="select-file-dialog-buttons-save"
                  primary
                  size="medium"
                  label={t("Common:SaveButton")}
                  onClick={onClickSave}
                  isDisabled={selectedFile.length === 0}
                />
                <Button
                  className="modal-dialog-button"
                  primary
                  size="medium"
                  label={t("Common:CloseButton")}
                  onClick={onClose}
                />
              </div>
            </StyledSelectFilePanel>
          </ModalDialog.Footer>
        </ModalDialog>
      </StyledAsidePanel>
    );
  }
}

const SelectFileDialogModalViewBodyWrapper = inject(
  ({ treeFoldersStore, selectedFolderStore }) => {
    const { setSelectedNode } = treeFoldersStore;

    const { setSelectedFolder } = selectedFolderStore;
    return {
      setSelectedFolder,
      setSelectedNode,
    };
  }
)(observer(SelectFileDialogModalViewBody));
class SelectFileDialogModalView extends React.Component {
  render() {
    return (
      <MobxProvider {...stores}>
        <SelectFileDialogModalViewBodyWrapper {...this.props} />
      </MobxProvider>
    );
  }
}

export default SelectFileDialogModalView;
