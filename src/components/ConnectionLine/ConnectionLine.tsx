import React from "react";
import { getBezierPath } from "reactflow";

export default ({ fromX, fromY, toX, toY, connectionStatus }) => {
  const getConnectionColor = () => {
    switch (connectionStatus) {
      case "invalid":
        return "red";
      case "valid":
        return "green";
      default:
        return "grey";
    }
  };

  const [edgePath] = getBezierPath({
    sourceX: fromX,
    sourceY: fromY,
    targetX: toX,
    targetY: toY,
  });

  return (
    <>
      <path
        fill="none"
        stroke={getConnectionColor()}
        strokeWidth={1.5}
        className="animated"
        d={edgePath}
      />
    </>
  );
};
