import { useState } from "react";
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

  .not-existing {
    font-size: 13px;
    font-weight: 600;
    color: #a3a9ae;
  }

  .user-existing {
    font-size: 13px;
    font-weight: 600;
    color: #2db482;
  }
`;

const UsersTableRow = ({ displayName, email, dublicate }) => {
  const [isChecked, setIsChecked] = useState(false);

  const isExistingUser = dublicate !== "—";

  const onChangeCheckbox = () => {
    setIsChecked((prev) => !prev);
  };

  return (
    <StyledTableRow checked={isChecked}>
      <TableCell>
        <Checkbox onChange={onChangeCheckbox} isChecked={isChecked} />
        <Text fontWeight={600}>{displayName}</Text>
      </TableCell>

      <TableCell>
        <Text className="user-email">{email}</Text>
      </TableCell>

      <TableCell>
        <Text className={isExistingUser ? "user-existing" : "not-existing"}>
          {dublicate}
        </Text>
      </TableCell>
    </StyledTableRow>
  );
};

export default UsersTableRow;