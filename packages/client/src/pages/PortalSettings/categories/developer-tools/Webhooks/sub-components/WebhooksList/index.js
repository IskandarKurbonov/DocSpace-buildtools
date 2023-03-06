import React, { useState, useRef } from "react";

import styled from "styled-components";

import TableContainer from "@docspace/components/table-container/TableContainer";
import TableHeader from "@docspace/components/table-container/TableHeader";
import TableBody from "@docspace/components/table-container/TableBody";

import { WebhooksListRow } from "../WebhooksListRow";

import { Consumer } from "@docspace/components/utils/context";

const TableWrapper = styled(TableContainer)`
  margin-top: 16px;
`;

export const WebhooksList = ({ webhooks, toggleEnabled, deleteWebhook, editWebhook }) => {
  const ref = useRef(null);

  const [columns, setColumns] = useState([
    {
      key: "Name",
      title: "Name",
      enable: true,
      default: true,
      active: true,
      minWidth: 200,
    },
    {
      key: "URL",
      title: "URL",
      enable: true,
      resizable: true,
    },
    {
      key: "State",
      title: "State",
      enable: true,
      resizable: true,
    },
    {
      key: "Settings",
      title: "",
    },
  ]);

  return (
    <Consumer>
      {(context) => {
        return (
          <TableWrapper forwardedRef={ref}>
            <TableHeader
              columns={columns}
              containerRef={ref}
              checkboxMargin="12px"
              checkboxSize="48px"
              sectionWidth={context.sectionWidth}
              showSettings={false}
            />
            <TableBody>
              {webhooks.map((webhook, index) => (
                <WebhooksListRow
                  key={webhook.id}
                  webhook={webhook}
                  index={index}
                  toggleEnabled={toggleEnabled}
                  deleteWebhook={deleteWebhook}
                  editWebhook={editWebhook}
                />
              ))}
            </TableBody>
          </TableWrapper>
        );
      }}
    </Consumer>
  );
};
