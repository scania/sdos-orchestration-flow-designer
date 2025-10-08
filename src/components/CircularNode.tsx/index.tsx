import { memo, useState, useEffect } from "react";
import { Popover } from "react-tiny-popover";
import { Handle, Position, useReactFlow, useKeyPress } from "reactflow";
import styles from "./CircularNode.module.scss";
import ActionsMenu from "../ActionsMenu/ActionsMenu";
import useOfdStore from "@/store/ofdStore";
import { TdsIcon } from "@scania/tegel-react";

// TODO - handle this dynamically in the future
const parameterLabels = [
  "Token Credentials Parameter",
  "Standard Parameter",
  "Basic Credentials Parameter",
  "HTTP Parameter",
  "TokenCredentialsParameter",
  "StandardParameter",
  "BasicCredentialsParameter",
  "HTTPParameter",
];

const isParameter = (label) => {
  return parameterLabels.includes(label);
};

export default memo((node) => {
  //@ts-ignore
  const deletePressed = useKeyPress(["Delete"]);
  const isGraphEditable = useOfdStore((state) => state.isGraphEditable);
  const { data, isConnectable, type, id } = node;
  const label = data?.formData.formFields[0]?.value;
  const { deleteElements } = useReactFlow();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  // Store
  const selectedNode = useOfdStore((state) => state.selectedNode);
  const setSelectedNode = useOfdStore((state) => state.setSelectedNode);
  const setSetupMode = useOfdStore((state) => state.setSetupMode);
  const connectedEdgesFromNode = useOfdStore(
    (state) => state.connectedEdgesFromNode
  );

  useEffect(() => {
    if (deletePressed && node.id === selectedNode?.id) {
      deleteNode();
    }
  }, [deletePressed]);

  const deleteNode = () => {
    if (node.data.label !== "Task" && isGraphEditable) {
      deleteElements({ nodes: [{ id }] });
      setSelectedNode(null);
      setSetupMode(false);
    }
    setIsPopoverOpen(false);
  };

  const disconnectNode = () => {
    deleteElements({ edges: [...connectedEdgesFromNode] });
    setIsPopoverOpen(false);
  };

  return (
    <div
      className={`${node.id === selectedNode?.id ? styles.selected : ""} 
        ${styles.container} ${
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
        <Popover
          isOpen={isPopoverOpen}
          onClickOutside={() => setIsPopoverOpen(false)}
          positions={["top", "bottom", "left", "right"]} // preferred positions by priority
          content={
            <ActionsMenu
              onDeleteClick={() => deleteNode()}
              onDisconnectClick={() => disconnectNode()}
            />
          }
        >
          <div
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            className={styles.headingContainer__popover}
          >
            <TdsIcon name="meatballs" size="20px"></TdsIcon>
          </div>
        </Popover>
      </div>
      <div data-tooltip={data.label} className={styles.labelContainer}>
        {label ? label : <span className={"opaque-35"}>Label</span>}
      </div>
      {type !== "input" && (
        <Handle
          type="target"
          position={Position.Left}
          id="a"
          isConnectable={isConnectable}
        />
      )}
      {type !== "output" && (
        <Handle
          type="source"
          position={Position.Right}
          id="a"
          isConnectable={isConnectable}
        />
      )}
    </div>
  );
});
