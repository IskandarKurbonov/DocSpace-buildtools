import React from "react";
import IconButton from "@docspace/components/icon-button";

const ArrowButton = ({ isRootFolder, onBackToParentFolder }) => {
  return (
    <>
      {!isRootFolder ? (
        <div className="navigation-arrow-container">
          <IconButton
            iconName="/static/images/arrow.path.react.svg"
            size="17"
            isFill={true}
            onClick={onBackToParentFolder}
            className="arrow-button"
          />
          <div className="navigation-header-separator" />
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default React.memo(ArrowButton);
