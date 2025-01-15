import styles from "./CustomEdge.module.scss";
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from "reactflow";
import EndMarker from "./EndMarker";

const CustomEdge = ({ id, data, ...props }) => {
  const [edgePath, labelX, labelY] = getBezierPath(props);

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
        <EndMarker />
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;
