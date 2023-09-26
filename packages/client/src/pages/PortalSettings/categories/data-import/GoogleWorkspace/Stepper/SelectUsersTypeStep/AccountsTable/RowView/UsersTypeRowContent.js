import { inject, observer } from "mobx-react";
import styled from "styled-components";

import Text from "@docspace/components/text";
import Box from "@docspace/components/box";
import RowContent from "@docspace/components/row-content";
import ComboBox from "@docspace/components/combobox";

const StyledRowContent = styled(RowContent)`
  display: flex;

  .row-main-container-wrapper {
    width: 100%;
    margin-right: 0;
  }

  .rowMainContainer {
    height: 100%;
    width: 100%;
  }

  .username {
    font-size: 14px;
    font-weight: 600;
    color: ${(props) => props.theme.client.settings.migration.subtitleColor};
  }

  .user-email {
    margin-right: 5px;
    font-size: 12px;
    font-weight: 600;
    color: ${(props) =>
      props.theme.client.settings.migration.tableRowTextColor};
  }

  .user-type {
    .combo-button {
      border: none;
      padding: 0;
      justify-content: flex-end;
      background-color: transparent;
    }

    .combo-button-label {
      color: ${(props) =>
        props.theme.client.settings.migration.tableRowTextColor};
    }

    .combo-buttons_arrow-icon {
      flex: initial;
      margin-left: 0;
    }

    svg {
      path {
        fill: ${(props) =>
          props.theme.client.settings.migration.tableRowTextColor};
      }
    }
  }
`;

const UsersTypeRowContent = ({
  id,
  sectionWidth,
  displayName,
  email,
  typeOptions,
  userTypeRef,
  type,
  changeType,
}) => {
  const onSelectUser = (e) => {
    changeType(id, e.key);
  };

  const selectedOption =
    typeOptions.find((option) => option.key === type) || {};

  const contentData = [
    <Box displayProp="flex" justifyContent="space-between" alignItems="center">
      <Box>
        <Text className="username">{displayName}</Text>
        <Text className="user-email">{email}</Text>
      </Box>

      <div ref={userTypeRef}>
        <ComboBox
          className="user-type"
          selectedOption={selectedOption}
          options={typeOptions}
          onSelect={onSelectUser}
          scaled
          size="content"
          displaySelectedOption
          modernView
          manualWidth="fit-content"
        />
      </div>
    </Box>,
  ];

  return (
    <StyledRowContent sectionWidth={sectionWidth}>
      {contentData}
    </StyledRowContent>
  );
};

export default inject(({ importAccountsStore }) => {
  const { changeType } = importAccountsStore;

  return {
    changeType,
  };
})(observer(UsersTypeRowContent));