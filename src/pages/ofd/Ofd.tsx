import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import styles from "./ofd.module.scss";
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  addEdge,
  Connection,
  Edge,
} from "reactflow";
import "reactflow/dist/style.css";

const initialNodes = [
  {
    id: "1",
    type: "input",
    data: { label: "Action" },
    position: { x: 250, y: 5 },
    // sourcePosition: "right",
  },
];

const ForceGraphComponent: React.FC = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const onConnect = useCallback(
    (params: Edge<any> | Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");

      // check if the dropped element is valid
      if (typeof type === "undefined" || !type) {
        return;
      }
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode = {
        id: crypto.randomUUID(),
        type: type === "Result Action" ? "output" : "default",
        position,
        // sourcePosition: "right",
        // targetPosition: "left",
        data: { label: type },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  const [classes, setClasses] = useState<any>([]);

  const forceGraphRef = useRef<any>();

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
      (item: { parentClassUri: string; className: string }, index: number) => {
        return (
          <tds-chip
            type="button"
            size="lg"
            draggable
            key={index}
            onDragStart={(e: any) => handleOnDrag(e, item.className)}
          >
            <span slot="label">{item.className}</span>
          </tds-chip>
        );
      }
    );
  };

  function handleOnDrag(e: React.DragEvent, nodeType: any) {
    e.dataTransfer.setData("application/reactflow", nodeType);
    e.dataTransfer.effectAllowed = "move";
  }

  return (
    <div className={styles.page}>
      <header className={styles.page__header}>
        <h1 className={styles.page__heading}>Your Heading Here</h1>
      </header>
      <main className={styles.page__main}>
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebar__primaryHeading}>Primary Heading</h2>
          <h3 className={styles.sidebar__secondaryHeading}>
            Secondary Heading
          </h3>
          <p className={styles.sidebar__description}>This is a description.</p>
          <div className={styles.sidebar__tabs}>{/* Tabs go here */}</div>
          <div className={styles.sidebar__chips}>{renderClasses()}</div>
        </aside>
        <section className={styles.graph__canvas}>
          <div>
            <ReactFlowProvider>
              <div
                className="reactflow-wrapper"
                ref={reactFlowWrapper}
                style={
                  typeof window !== "undefined"
                    ? {
                        height: window.innerHeight - 400,
                        width: window.innerWidth,
                      }
                    : {}
                }
              >
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onInit={setReactFlowInstance}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  fitView
                >
                  <Controls />
                  {/* @ts-ignore */}
                  <Background />
                </ReactFlow>
              </div>
            </ReactFlowProvider>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ForceGraphComponent;
