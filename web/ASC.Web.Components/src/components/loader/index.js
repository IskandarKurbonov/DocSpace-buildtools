
import React from "react";
import PropTypes from "prop-types";

import { Oval } from "./types/oval";
import { DualRing } from "./types/dual-ring";
import { Rombs } from "./types/rombs";

const Loader = (props) =>  {
    const { type, color, size, label, className, style, id } = props;
  
    const svgRenderer = type => {
      switch (type) {
        case "oval":
          return <Oval {...props} />;
        case "dual-ring":
          return <DualRing {...props} />;
        case "rombs":
          return <Rombs {...props} />;
        default:
          return (
              <span style={{...style, color: color, fontSize: size }}>{label}</span>
          );
      }
    };
  
    return (
        <div aria-busy="true" className={className} style={style} id={id}>{svgRenderer(type)}</div>
    );
  };

  Loader.propTypes = {
    color: PropTypes.string,
    type: PropTypes.oneOf(['base', 'oval', 'dual-ring', 'rombs']),
    size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    label: PropTypes.string,
    className: PropTypes.string,
    id: PropTypes.string,
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array])
  };

  Loader.defaultProps = {
    color: "#63686a",
    type: "base",
    size: 40,
    label: "Loading content, please wait."
  };

  export default Loader;