import React, { useState } from "react";
import styled from "styled-components";

import ImportSection from "../../../sub-components/ImportSection";

import PeopleIcon from "PUBLIC_DIR/images/catalog.accounts.react.svg";
import UserIcon from "PUBLIC_DIR/images/catalog.user.react.svg";
import SaveCancelButtons from "@docspace/components/save-cancel-buttons";

const SectionsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  .save-cancel-buttons {
    margin-top: 4px;
  }
`;

const FifthStep = ({ t, incrementStep, decrementStep }) => {
  const [isChecked, setIsChecked] = useState({
    users: true,
    pFiles: true,
    sFiles: true,
  });

  const onChange = (name) => {
    setIsChecked((prevIsChecked) => ({
      ...prevIsChecked,
      [name]: !prevIsChecked[name],
    }));
  };

  const users = t("Settings:Employees")[0].toUpperCase() + t("Settings:Employees").slice(1);

  return (
    <SectionsWrapper>
      <ImportSection
        isChecked={isChecked.users}
        onChange={() => onChange("users")}
        sectionName={users}
        description={t("Settings:UsersSectionDescription")}
        exportSection={{ sectionName: users, workspace: "NextCloud" }}
        importSection={{
          sectionName: t("Common:Accounts"),
          workspace: "DocSpace",
          SectionIcon: PeopleIcon,
        }}
        isDisabled
      />
      <ImportSection
        isChecked={isChecked.pFiles}
        onChange={() => onChange("pFiles")}
        sectionName={t("Settings:PersonalFiles")}
        description={t("Settings:PersonalFilesDescription", { serviceName: "Nextcloud" })}
        exportSection={{
          sectionName: t("Settings:UsersFiles"),
          workspace: "NextCloud",
        }}
        importSection={{
          sectionName: t("Common:Accounts"),
          workspace: t("Settings:MyDocuments"),
          SectionIcon: UserIcon,
        }}
      />
      <ImportSection
        isChecked={isChecked.sFiles}
        onChange={() => onChange("sFiles")}
        sectionName={t("Settings:SharedFiles")}
        description={t("Settings:SharedFilesDescription", { serviceName: "Nextcloud" })}
        exportSection={{
          sectionName: t("Settings:SharedFiles"),
          workspace: "NextCloud",
        }}
        importSection={{
          sectionName: t("Settings:MyDocuments"),
          workspace: "DocSpace",
          SectionIcon: PeopleIcon,
        }}
      />

      <SaveCancelButtons
        className="save-cancel-buttons"
        onSaveClick={incrementStep}
        onCancelClick={decrementStep}
        saveButtonLabel={t("Settings:NextStep")}
        cancelButtonLabel={t("Common:Back")}
        displaySettings
        showReminder
      />
    </SectionsWrapper>
  );
};
export default FifthStep;
