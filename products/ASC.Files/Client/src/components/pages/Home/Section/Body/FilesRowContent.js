
import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { withTranslation } from "react-i18next";
import styled from "styled-components";
import { RowContent, Link, Text, Icons, Badge, TextInput, Button } from "asc-web-components";
import { createFile, createFolder, renameFolder, updateFile, setFilter, fetchFiles } from '../../../../../store/files/actions';
import { canWebEdit, canConvert, getTitleWithoutExst } from '../../../../../store/files/selectors';
import { history } from "asc-web-common";
import store from "../../../../../store/store";

class FilesRowContent extends React.PureComponent {

  constructor(props) {
    super(props);
    const titleWithoutExt = getTitleWithoutExst(props.item);

    this.state = {
      itemTitle: titleWithoutExt,
      editingId: props.fileAction.tempId,
      loading: false
    };
  }

  completeAction = () => {
    this.setState({ loading: false }, () =>
      this.props.onEditComplete());
  }

  updateItem = () => {
    const { fileAction, updateFile, renameFolder, item } = this.props;
    const { itemTitle } = this.state;
    const originalTitle = getTitleWithoutExst(item);

    this.setState({ loading: true });

    if (originalTitle === itemTitle)
      return this.completeAction();

    item.fileExst
      ? updateFile(fileAction.tempId, itemTitle)
        .then(() => this.completeAction())
      : renameFolder(fileAction.tempId, itemTitle)
        .then(() => this.completeAction());
  };

  createItem = () => {
    const { createFile, createFolder, item } = this.props;
    const { itemTitle } = this.state;

    this.setState({ loading: true });

    if (itemTitle.trim() === '')
      return this.completeAction();

    !item.fileExst
      ? createFolder(item.parentId, itemTitle)
        .then(() => this.completeAction())
      : createFile(item.parentId, `${itemTitle}.${item.fileExst}`)
        .then(() => this.completeAction())
  }

  componentDidUpdate(prevProps) {
    const { fileAction } = this.props;

    if (fileAction.tempId !== prevProps.fileAction.tempId) {
      this.setState({ editingId: fileAction.tempId })
    }
  }

  renameTitle = e => {
    this.setState({ itemTitle: e.target.value });
  }

  cancelUpdateItem = () => {
    this.setState({ loading: false });
    this.completeAction();
  }

  onClickUpdateItem = () => {
    (this.props.fileAction.type === 'create')
      ? this.createItem()
      : this.updateItem();
  }

  onKeyUpUpdateItem = e => {
    if (e.keyCode === 13) {
      (this.props.fileAction.type === 'create')
        ? this.createItem()
        : this.updateItem();
    }

    if (e.keyCode === 27)
      return this.cancelUpdateItem()
  }

  onFilesClick = () => {
    const { id, fileExst } = this.props.item;
    const { filter } = this.props;
    if (!fileExst) {
      const a =
        history.location.search !== ""
          ? history.location.search
          : history.location.state;
      const url = `${history.location.pathname}${a}`;
      history.push(`${url}#${id}`);

      const newFilter = filter.clone();
      newFilter.treeFolders.push(id.toString());
      fetchFiles(id, newFilter, store.dispatch);
    }
  };

  getStatusByDate = () => {
    const { culture, t, item } = this.props;
    const { created, updated, version, fileExst } = item;

    const title = version > 1
      ? t("TitleModified")
      : fileExst
        ? t("TitleUploaded")
        : t("TitleCreated");

    const date = fileExst ? updated : created;
    const dateLabel = new Date(date).toLocaleString(culture);

    return `${title}: ${dateLabel}`;
  };

  render() {
    const { t, item } = this.props;
    const { itemTitle, editingId, loading } = this.state;
    const {
      contentLength,
      updated,
      createdBy,
      fileExst,
      filesCount,
      fileStatus,
      foldersCount,
      id,
      versionGroup
    } = item;

    const SimpleFilesRowContent = styled(RowContent)`
    .badge-ext {
      margin-left: -8px;
      margin-right: 8px;
    }

    .badge {
      margin-right: 8px;
    }

    .badges {
      display: flex;
      align-items: center;
    }

    .share-icon {
      margin-top: -4px;
      padding-right: 8px;
    }
    `;

    const EditingWrapper = styled.div`
      width: 100%;
      display: inline-flex;
      align-items: center;

      @media (max-width: 1024px) {
      height: 56px;
    }
      .edit-text {
        height: 30px;
      }
      .edit-button {
        margin-left: 8px;
        height: 30px;
      }

      .edit-ok-icon {
        margin-top: -6px;
        width: 16px;
        height: 16px;
      }

      .edit-cancel-icon {
        margin-top: -6px;
        width: 14px;
        height: 14px;
      }
    `;

    const titleWithoutExt = getTitleWithoutExst(item);
    const fileOwner = createdBy && ((this.props.viewer.id === createdBy.id && t("AuthorMe")) || createdBy.displayName);
    const updatedDate = updated && this.getStatusByDate();
    const canEditFile = fileExst && canWebEdit(fileExst);
    const canConvertFile = fileExst && canConvert(fileExst);

    const okIcon = <Icons.CheckIcon
      className='edit-ok-icon'
      size='scale'
      isfill={true}
      color='#A3A9AE'
    />;

    const cancelIcon = <Icons.CrossIcon
      className='edit-cancel-icon'
      size='scale'
      isfill={true}
      color='#A3A9AE'
    />;

    const isEdit = id === editingId;

    return isEdit
      ? (<EditingWrapper>
        <TextInput
          className='edit-text'
          name='title'
          scale={true}
          value={itemTitle}
          tabIndex={1}
          isAutoFocussed={true}
          onChange={this.renameTitle}
          onKeyUp={this.onKeyUpUpdateItem}
          isDisabled={loading}
        />
        <Button
          className='edit-button'
          size='medium'
          isDisabled={loading}
          onClick={this.onClickUpdateItem}
          icon={okIcon}
        />
        <Button
          className='edit-button'
          size='medium'
          isDisabled={loading}
          onClick={this.cancelUpdateItem}
          icon={cancelIcon}
        />
      </EditingWrapper>)
      : (
        <SimpleFilesRowContent
          sideColor="#333"
          isFile={fileExst}
        >
          <Link
            containerWidth='100%'
            type='page'
            title={titleWithoutExt}
            fontWeight="bold"
            onClick={this.onFilesClick}
            fontSize='15px'
            color="#333"
            isTextOverflow={true}
          >
            {titleWithoutExt}
          </Link>
          <>
            {fileExst &&
              <div className='badges'>
                <Text
                  className='badge-ext'
                  as="span"
                  color="#A3A9AE"
                  fontSize='15px'
                  fontWeight={600}
                  title={fileExst}
                  truncate={true}
                >
                  {fileExst}
                </Text>
                {canConvertFile &&
                  <Icons.FileActionsConvertIcon
                    className='badge'
                    size='small'
                    isfill={true}
                    color='#A3A9AE'
                  />
                }
                {canEditFile &&
                  <Icons.AccessEditIcon
                    className='badge'
                    size='small'
                    isfill={true}
                    color='#A3A9AE'
                  />
                }
                {fileStatus === 1 &&
                  <Icons.FileActionsConvertEditDocIcon
                    className='badge'
                    size='small'
                    isfill={true}
                    color='#3B72A7'
                  />
                }
                {false &&
                  <Icons.FileActionsLockedIcon
                    className='badge'
                    size='small'
                    isfill={true}
                    color='#3B72A7'
                  />
                }
                {versionGroup > 1 &&
                  <Badge
                    className='badge-version'
                    backgroundColor="#A3A9AE"
                    borderRadius="11px"
                    color="#FFFFFF"
                    fontSize="10px"
                    fontWeight={800}
                    label={`Ver.${versionGroup}`}
                    maxWidth="50px"
                    onClick={() => { }}
                    padding="0 5px"
                  />
                }
                {fileStatus === 2 &&
                  <Badge
                    className='badge-version'
                    backgroundColor="#ED7309"
                    borderRadius="11px"
                    color="#FFFFFF"
                    fontSize="10px"
                    fontWeight={800}
                    label={`New`}
                    maxWidth="50px"
                    onClick={() => { }}
                    padding="0 5px"
                  />
                }
              </div>
            }
          </>
          <Text
            containerMinWidth='120px'
            containerWidth='10%'
            as="div"
            color="#333"
            fontSize='12px'
            fontWeight={600}
            title={fileOwner}
            truncate={true}
          >
            {fileOwner}
          </Text>
          <Link
            containerMinWidth='190px'
            containerWidth='15%'
            type='page'
            title={updatedDate}
            fontSize='12px'
            fontWeight={400}
            color="#333"
            onClick={() => { }}
            isTextOverflow={true}
          >
            {updatedDate && updatedDate}
          </Link>
          <Text
            containerMinWidth='90px'
            containerWidth='8%'
            as="div"
            color="#333"
            fontSize='12px'
            fontWeight={600}
            title=''
            truncate={true}
          >
            {fileExst
              ? contentLength
              : `${t("TitleDocuments")}: ${filesCount} / ${t("TitleSubfolders")}: ${foldersCount}`}
          </Text>
        </SimpleFilesRowContent>
      )
  }
};

function mapStateToProps(state) {
  return {
    filter: state.files.filter,
    fileAction: state.files.fileAction
  }
}

export default connect(mapStateToProps, { createFile, createFolder, updateFile, renameFolder, setFilter })(
  withRouter(withTranslation()(FilesRowContent))
);