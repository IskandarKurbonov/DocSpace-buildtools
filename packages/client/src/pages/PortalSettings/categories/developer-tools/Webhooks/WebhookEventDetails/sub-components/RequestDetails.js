import React from "react";
import styled from "styled-components";
import { Text, Textarea } from "@docspace/components";

const DetailsWrapper = styled.div`
  width: 100%;
`;

export const RequestDetails = ({ webhookDetails }) => {
  return (
    <DetailsWrapper>
      <Text as="h3" fontWeight={600} style={{ marginBottom: "4px" }}>
        Request post header
      </Text>
      <Textarea
        value={webhookDetails.requestHeaders}
        enableCopy
        hasNumeration
        isFullHeight
        isJSONField
      />
      <Text as="h3" fontWeight={600} style={{ marginBottom: "4px", marginTop: "16px" }}>
        Request post body
      </Text>
      <Textarea
        value={webhookDetails.requestPayload}
        isJSONField
        enableCopy
        hasNumeration
        isFullHeight
      />
    </DetailsWrapper>
  );
};
