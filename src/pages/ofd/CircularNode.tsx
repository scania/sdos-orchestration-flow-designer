import React, { memo } from "react";
import { Handle, Position } from "reactflow";

const ellipsisStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  "z-index": 999999,
};

const nodeStyle = {
  //   width: "60px",
  //   height: "60px",
  //   border: "2px solid #555",
  //   borderRadius: "50%", // This makes the node circular
  //   display: "flex",
  //   justifyContent: "center",
  //   alignItems: "center",
  //   backgroundColor: "red",
};

export default memo((node) => {
  //@ts-ignore
  const { data, isConnectable, type } = node;
  const { label, color } = data;
  return (
    //@ts-ignore
    <div style={nodeStyle}>
      {/* @ts-ignore */}
      <div className="ellipsis" data-tooltip={data.label} style={ellipsisStyle}>
        {data.label}
      </div>
      {/* @ts-ignore */}
      <div
        className="ellipsis"
        data-tooltip={data.label}
        style={{ ...ellipsisStyle, fontSize: "6px", marginTop: "10px" }}
      >
        {data?.classData?.["rdfs:label"]}
      </div>
      {type !== "input" ? (
        //@ts-ignore
        <Handle
          type="target"
          position={Position.Left}
          id="a"
          style={{
            background: "#555",
          }}
          isConnectable={isConnectable}
        />
      ) : (
        <></>
      )}
      {type !== "output" ? (
        <Handle
          type="source"
          position={Position.Right}
          id="a"
          style={{
            background: "#555",
          }}
          isConnectable={isConnectable}
        />
      ) : (
        <></>
      )}
    </div>
  );
});
