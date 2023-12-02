import { generateClassId } from "@/utils";
import React, { memo, useEffect } from "react";
import { Handle, Position } from "reactflow";
const ellipsisStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center", // Centers content vertically
  alignItems: "center", // Centers content horizontally
  width: "66px",
  height: "44px",
  zIndex: 999999,
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -60%)",
  overflow: "hidden",
  textOverflow: "ellipsis",
  fontSize: "6px",
};

const ellipsisLabel = {
  width: "60px",
  height: "10px",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -60%)",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontWeight: 700,
  fontSize: "7px",
  marginTop: "22px",
};

export default memo((node) => {
  //@ts-ignore
  const { data, isConnectable, type, id } = node;
  return (
    //@ts-ignore
    <div>
      {/* @ts-ignore */}
      <div
        data-tooltip={data.label}
        //@ts-ignore
        style={{
          ...ellipsisStyle,
          fontSize: data.label?.length > 20 ? "9px" : "11px",
        }}
      >
        {data.label}
      </div>
      {/* @ts-ignore */}
      <div
        // className="ellipsis"
        data-tooltip={data.label}
        //@ts-ignore
        style={{
          ...ellipsisLabel,
          fontSize: "6px",
          marginTop: "20px",
        }}
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
