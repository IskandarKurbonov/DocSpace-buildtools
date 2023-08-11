import { useState, useRef } from "react";

import AccessRightSelect from "@docspace/components/access-right-select";
import TableRow from "@docspace/components/table-container/TableRow";
import TableCell from "@docspace/components/table-container/TableCell";
import Text from "@docspace/components/text";
import Checkbox from "@docspace/components/checkbox";
import styled from "styled-components";

const StyledTableRow = styled(TableRow)`
  .table-container_cell {
    padding-right: 30px;
    text-overflow: ellipsis;
  }

  .user-email {
    margin-right: 5px;
    font-size: 13px;
    font-weight: 600;
    color: #a3a9ae;
  }

  .user-type {
    .combo-button {
      border: none;
      padding: 0;
      justify-content: flex-start;
      background-color: transparent;
    }

    .combo-button-label {
      color: #a3a9ae;
    }

    .combo-buttons_arrow-icon {
      flex: initial;
      margin-left: 0;
    }

    svg {
      path {
        fill: #a3a9ae;
      }
    }
  }
`;

const data = [
  {
    key: "key1",
    label: "DocSpace admin",
  },
  {
    key: "key2",
    label: "Room admin",
  },
  {
    key: "key3",
    label: "Power user",
  },
];

const UsersTypeTableRow = ({
  id,
  displayName,
  email,
  // type,
  isChecked,
  checkbox,
  onChangeCheckbox,
}) => {
  const [selectUserType, setSelectUserType] = useState(data[2]);
  const userTypeRef = useRef();

  const onChange = (e) => {
    onChangeCheckbox(id, e.target.checked);
  };

  return (
    <StyledTableRow checked={isChecked}>
      <TableCell>
        <Checkbox isChecked={checkbox.includes(id)} onChange={onChange} />
        <Text fontWeight={600}>{displayName}</Text>
      </TableCell>

      <TableCell>
        <div ref={userTypeRef}>
          <AccessRightSelect
            accessOptions={data}
            selectedOption={selectUserType}
            scaledOptions={false}
            scaled={false}
            manualWidth="fit-content"
            className="user-type"
            onSelect={setSelectUserType}
          />
        </div>
      </TableCell>

      <TableCell>
        <Text className="user-email">{email}</Text>
      </TableCell>
    </StyledTableRow>
  );
};

export default UsersTypeTableRow;