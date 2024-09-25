import React from 'react';
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from 'reactflow';
import EndMarker from "./EndMarker"
 
const CustomEdge = ({ id, data, ...props }) => {
  const [edgePath, labelX, labelY] = getBezierPath(props);
 
  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd="url('#end-marker')"/>
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: '#fff',
            padding: 10,
            borderRadius: 5,
            fontSize: 12,
            fontWeight: 700,
          }}
          className="nodrag nopan"
        >
          {props.label}
        </div>
        <EndMarker />
      </EdgeLabelRenderer>
    </>
  );
};
 
export default CustomEdge;