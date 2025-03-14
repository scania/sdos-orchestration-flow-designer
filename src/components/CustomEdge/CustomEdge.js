import styles from "./CustomEdge.module.scss";

import { getBezierPath, EdgeLabelRenderer, BaseEdge, useReactFlow } from "reactflow";
import EndMarker from "./EndMarker";

const CustomEdge = ({ id, data, ...props }) => {
  const [edgePath, labelX, labelY] = getBezierPath(props);
  const { deleteElements } = useReactFlow();


  function DisconnectLine() {
    return (
      <div
        onClick={() => deleteElements({ edges: [{ id }] })}
        className={`${styles.disconnect} nodrag nopan`}
        style={{
          transform: `translate(-50%, -50%) translate(${labelX}px,${labelY +20}px)`
        }}
      >
        <tds-icon size="20px" name={"cross"}/>
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
        {props.selected &&
          <DisconnectLine/>
        } 
        <EndMarker />
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;

