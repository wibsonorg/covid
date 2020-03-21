import React from "react";
import { Box } from "grommet";

export default props => (
  <Box style={props.style}>
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="none" stroke={props.fill || "#444"} fill="none">
      <path stroke-width="26" d="M209,15a195,195 0 1,0 2,0z"/>
      <path stroke-width="18" d="m210,15v390m195-195H15M59,90a260,260 0 0,0 302,0 m0,240 a260,260 0 0,0-302,0M195,20a250,250 0 0,0 0,382 m30,0 a250,250 0 0,0 0-382"/>
    </svg>
  </Box>
);