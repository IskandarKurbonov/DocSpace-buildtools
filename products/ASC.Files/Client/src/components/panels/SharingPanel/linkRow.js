import React from "react";
import { Row, LinkWithDropdown, ToggleButton, Icons } from "asc-web-components";
import { StyledLinkRow } from "../StyledPanels";
import { constants } from "asc-web-common";

const { ShareAccessRights } = constants;

class LinkRow extends React.Component {

  render() {
    const {
      linkText,
      options,
      index,
      t,
      embeddedComponentRender,
      accessOptions,
      item,
      withToggle,
      onToggleLink,
    } = this.props;

    const isChecked = item.rights.accessNumber !== ShareAccessRights.DenyAccess;
    const isDisabled = withToggle ? !isChecked : false;

    return (
      <StyledLinkRow withToggle={withToggle} isDisabled={isDisabled}>
        <Row
          className="link-row"
          key={`${linkText}-key_${index}`}
          element={
            withToggle ? (
              embeddedComponentRender(accessOptions, item, isDisabled)
            ) : (
              <Icons.AccessEditIcon
                size="medium"
                className="sharing_panel-owner-icon"
              />
            )
          }
          contextButtonSpacerWidth="0px"
        >
          <>
            <LinkWithDropdown
              className="sharing_panel-link"
              color="#333333"
              dropdownType="alwaysDashed"
              data={options}
              fontSize="14px"
              fontWeight={600}
              isDisabled={isDisabled}
            >
              {t(linkText)}
            </LinkWithDropdown>
            {withToggle && (
              <div>
                <ToggleButton
                  isChecked={isChecked}
                  onChange={() => onToggleLink(item)}
                />
              </div>
            )}
          </>
        </Row>
      </StyledLinkRow>
    );
  }
}

export default LinkRow;
