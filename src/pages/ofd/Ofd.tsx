import React, { useEffect, useRef, useState } from "react";
import { ForceGraph2D } from "react-force-graph";
import axios from "axios";

interface GraphNode {
  id: string;
  name: string;
}

interface GraphLink {
  source: string;
  target: string;
  name: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

const ForceGraphComponent: React.FC = () => {
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [
      { id: "1", name: "Node 1" },
      { id: "2", name: "Node 2" },
      { id: "3", name: "Node 1" },
      { id: "2", name: "Node 2" },
    ],
    links: [{ source: "1", target: "2", name: "hasNextAction" }],
  });

  const [classes, setClasses] = useState<any>([]);

  const forceGraphRef = useRef<any>();
  console.log(classes);

  useEffect(() => {
    // After initial render, zoom out slightly

    if (forceGraphRef.current) {
      forceGraphRef.current.zoom(5); // Adjust the zoom level to your preference
    }
  }, []);

  useEffect(() => {
    const fetchClasses = async () => {
      const response = await axios.get("http://localhost:3000/api/classes");
      setClasses(response.data);
    };

    fetchClasses();
  }, []);

  const renderClasses = () => {
    return classes.map(
      (item: { parentClassUri: string; className: string }) => {
        return (
          <li>
            `{item.className} {item.parentClassUri}`
          </li>
        );
      }
    );
  };

  return (
    <>
      <ul>{renderClasses()}</ul>
      <ForceGraph2D
        graphData={graphData}
        ref={forceGraphRef}
        height={window.innerHeight - 250}
        width={window.innerWidth}
        nodeLabel="name"
        nodeAutoColorBy="name"
        onNodeClick={(node) => console.log(`Clicked: ${JSON.stringify(node)}`)}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkCurvature={0.25}
        maxZoom={10}
        minZoom={0.8}
        linkLabel="name"
      />
    </>
  );
};

export default ForceGraphComponent;
