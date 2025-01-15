import styles from "./CustomEdge.module.scss";

const EndMarker = () => {
 
  return (
        <svg style={{ position: "absolute", top: 0, left: 0 }}>
        <defs>
          <marker
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
              class={styles.endMarker}
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