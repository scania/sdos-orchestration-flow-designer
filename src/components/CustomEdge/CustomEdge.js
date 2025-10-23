import styles from "./CustomEdge.module.scss";
import userPreferencesStore from "../../store/userPreferencesStore"; // Import the store

import {
  getBezierPath,
  getStraightPath,
  getSmoothStepPath,
  EdgeLabelRenderer,
  BaseEdge,
  useReactFlow,
} from "reactflow";
import EndMarker from "./EndMarker";
import { TdsIcon } from "@scania/tegel-react";

const CustomEdge = ({ id, data, ...props }) => {
  const { connectionType } = userPreferencesStore();

  const getEdgeType = () => {
    switch (connectionType) {
      case "steps":
        return getSmoothStepPath(props);
      case "straight":
        return getStraightPath(props);
      case "bezier":
        return getBezierPath(props);
      default:
        return getBezierPath(props);
    }
  };

  const [edgePath, labelX, labelY] = getEdgeType(props);
  const { deleteElements } = useReactFlow();

  function DisconnectLine() {
    return (
      <div
        onClick={() => deleteElements({ edges: [{ id }] })}
        className={`${styles.disconnect} nodrag nopan`}
        style={{
          transform: `translate(-50%, -50%) translate(${labelX}px,${
            labelY + 20
          }px)`,
        }}
      >
        <TdsIcon size="20px" name={"cross"} />
      </div>
    );
  }

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd="url('#end-marker')" />
      <EdgeLabelRenderer>
        <div
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
          className={`${styles.edgeLabel} nodrag nopan`}
        >
          {props.label}
        </div>
        {props.selected && <DisconnectLine />}
        <EndMarker />
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;
