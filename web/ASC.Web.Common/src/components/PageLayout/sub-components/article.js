import React from "react";
import styled, { css } from "styled-components";
import PropTypes from "prop-types";
import { utils } from "asc-web-components";
import { Resizable } from "re-resizable";
import { isMobile } from "react-device-detect";
import { connect } from "react-redux";
import { getIsLoaded } from "../../../store/auth/selectors";

const { tablet } = utils.device;

const StyledArticle = styled.article`
  @media ${tablet} {
    ${(props) =>
      props.visible &&
      !props.pinned &&
      css`
        position: fixed;
        z-index: 400;
      `}
  }
  .resizable-block {
    padding: 0 24px;
    background: #f8f9f9;
    min-width: 265px;
    height: 100% !important;
    max-width: ${(props) => (props.isLoaded ? "calc(100vw - 368px)" : "265px")};
    box-sizing: border-box;
    overflow: hidden auto;
    display: flex;
    flex-direction: column;
    .resizable-border {
      div {
        cursor: ew-resize !important;
      }
    }
    @media ${tablet} {
      padding: 0 16px;
      ${(props) =>
        props.visible
          ? props.pinned
            ? `
            min-width: 240px;
            margin-top: ${props.isLoaded ? "0" : "56px"};
            max-width: ${props.isLoaded ? "calc(100vw - 368px)" : "240px"};
            height: calc(100% - 56px)!important;
			
			.increaseHeight {
              position: fixed;
              height: 100%;
              top: 0;
              left: 0;
              min-width: 240px;
              background: #f8f9f9;
              z-index: -1;
            }
          `
            : `
            position: fixed !important;
            width: 240px !important;
            min-width: 240px;
            max-width: 240px;
            position: fixed;
            height: 100% !important;
            top: 0;
            left: 0;
            z-index: 400;
            .resizable-border {
              display: none;
            }
          `
          : `
          display: none;
          `}
    }
  }
`;

class Article extends React.Component {
  render() {
    //console.log("PageLayout Article render", this.props);
    const { children, ...rest } = this.props;
    const enable = {
      top: false,
      right: !isMobile,
      bottom: false,
      left: false,
    };
    return (
      <StyledArticle {...rest}>
        <Resizable
          enable={enable}
          className="resizable-block"
          handleWrapperClass="resizable-border"
        >
          {children}
          <div className="increaseHeight"></div>
        </Resizable>
      </StyledArticle>
    );
  }
}

Article.propTypes = {
  children: PropTypes.any,
};

export default Article;
