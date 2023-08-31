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

  .username {
    font-size: 13px;
    font-weight: 600;
    color: ${(props) => props.theme.client.settings.migration.subtitleColor};
  }

  .user-email {
    margin-right: 5px;
    font-size: 13px;
    font-weight: 600;
    color: ${(props) =>
      props.theme.client.settings.migration.tableRowTextColor};
  }

  .not-existing {
    font-size: 13px;
    font-weight: 600;
    color: ${(props) =>
      props.theme.client.settings.migration.tableRowTextColor};
  }

  .user-existing {
    font-size: 13px;
    font-weight: 600;
    color: ${(props) =>
      props.theme.client.settings.migration.existingTextColor};
  }
`;

const UsersTableRow = ({
  displayName,
  email,
  dublicate,
  isChecked,
  toggleAccount,
}) => {
  const isExistingUser = dublicate !== "—";

  return (
    <StyledTableRow checked={isChecked} onClick={toggleAccount}>
      <TableCell>
        <Checkbox isChecked={isChecked} onChange={toggleAccount} />
        <Text className="username">{displayName}</Text>
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