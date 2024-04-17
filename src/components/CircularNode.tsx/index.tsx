import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import styles from "./CircularNode.module.scss";

// TODO - handle this dynamically in the future
const parameterLabels = [
  "Token Credentials Parameter",
  "Standard Parameter",
  "Basic Credentials Parameter",
  "HTTP Parameter",
];

const isParameter = (label) => {
  return parameterLabels.includes(label);
};

export default memo((node) => {
  //@ts-ignore
  const { data, isConnectable, type, id } = node;
  const label = data?.formData[0]?.value;

  return (
    <div
      className={`${node.selected ? styles.selected : ""} ${styles.container} ${
        data.label === "Task"
          ? styles.container__task
          : isParameter(data.label)
          ? styles.container__secondary
          : styles.container__primary
      }`}
    >
      <div className={styles.headingContainer}>
        <div
          data-tooltip={label}
          className={`${styles.chip} ${
            data.label === "Task"
              ? styles.chip__task
              : isParameter(data.label)
              ? styles.chip__secondary
              : styles.chip__primary
          }`}
        >
          {data.label}
        </div>
        <div>
          <tds-icon name="meatballs" size="20px"></tds-icon>
        </div>
      </div>
      <div data-tooltip={data.label} className={styles.labelContainer}>
        {label ? label : <span className={"opaque-35"}>Label</span>}
      </div>
      {type !== "input" ? (
        <Handle
          type="target"
          position={Position.Left}
          id="a"
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
          isConnectable={isConnectable}
        />
      ) : (
        <></>
      )}
    </div>
  );
});
