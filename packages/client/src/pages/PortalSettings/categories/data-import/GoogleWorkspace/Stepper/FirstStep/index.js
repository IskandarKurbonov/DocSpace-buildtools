import { useState } from "react";
import { inject, observer } from "mobx-react";
import styled from "styled-components";

import Text from "@docspace/components/text";
import Button from "@docspace/components/button";
import FileInput from "@docspace/components/file-input";
import ProgressBar from "@docspace/components/progress-bar";
import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import { CancelUploadDialog } from "SRC_DIR/components/dialogs";

const Wrapper = styled.div`
  max-width: 350px;

  .choose-backup-file {
    font-weight: 600;
    line-height: 20px;
    margin-bottom: 4px;
  }

  .upload-backup-input {
    height: 32px;
    margin-bottom: 16px;
  }

  .upload-backup-text {
    font-size: 12px;
    margin-top: -4px;
    margin-bottom: 12px;
  }

  .data-import-progress-bar {
    margin: 12px 0 16px;
    width: 350px;
  }
`;

const FirstStep = ({
  t,
  onNextStepClick,
  onPrevStepClick,
  showReminder,
  setShowReminder,
  cancelDialogVisble,
  setCancelDialogVisbile,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const onClickInput = (file) => {
    let data = new FormData();
    data.append("file", file);
    setShowReminder(true);
    setIsLoading(true);
  };

  const onClickButton = () => {
    setCancelDialogVisbile(true);
    setIsLoading(false);
  };

  return (
    <>
      <Wrapper>
        <Text className="choose-backup-file">{t("Settings:ChooseBackupFile")}</Text>
        <FileInput
          onInput={onClickInput}
          className="upload-backup-input"
          placeholder={t("Settings:BackupFile")}
          scale
        />
      </Wrapper>
      {isLoading ? (
        <Wrapper>
          <Text className="upload-backup-text">{t("Settings:BackupFileUploading")}</Text>
          <ProgressBar percent={75} className="data-import-progress-bar" />
          <Button size="small" label={t("Common:CancelButton")} onClick={onClickButton} />
        </Wrapper>
      ) : (
        <SaveCancelButtons
          className="save-cancel-buttons"
          onSaveClick={onNextStepClick}
          onCancelClick={onPrevStepClick}
          showReminder={showReminder}
          saveButtonLabel={t("Settings:UploadToServer")}
          cancelButtonLabel={t("Common:Back")}
          displaySettings={true}
        />
      )}

      {cancelDialogVisble && (
        <CancelUploadDialog
          visible={cancelDialogVisble}
          loading={isLoading}
          onClose={() => setCancelDialogVisbile(false)}
        />
      )}
    </>
  );
};

export default inject(({ dialogsStore }) => {
  const { cancelUploadDialogVisible, setCancelUploadDialogVisible } = dialogsStore;
  return {
    cancelDialogVisble: cancelUploadDialogVisible,
    setCancelDialogVisbile: setCancelUploadDialogVisible,
  };
})(observer(FirstStep));