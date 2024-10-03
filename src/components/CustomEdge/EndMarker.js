import React from 'react';
 
const EndMarker = ({selected}) => {
 
  return (
        <svg style={{ position: "absolute", top: 0, left: 0 }}>
        <defs>
          <marker
            className="react-flow__arrowhead"
            id="end-marker"
            markerWidth="40"
            markerHeight="40"
            viewBox="-10 -10 20 20"
            markerUnits="strokeWidth"
            orient="auto-start-reverse"
            refX="1"
            refY="0"
          >
            <polyline
              style={{
                stroke: "#0d0f13",
                fill: "#0d0f13",
                strokeWidth: 1,
              }}
              strokeLinecap="round"
              strokeLinejoin="round"
              points="-5,-4 0,0 -5,4 -5,-4"
            />
          </marker>
        </defs>
      </svg>
  );
};
 
export default EndMarker;