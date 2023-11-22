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
  MarkerType,
  Node,
} from "reactflow";
import "reactflow/dist/style.css";
import { useQuery } from "react-query";
import CircularNode from "./CircularNode";

const initialNodes = [
  {
    id: "1",
    type: "input",
    data: { label: "Task" },
    position: { x: 0, y: 0 },
    sourcePosition: "right",
  },
];

const nodeTypes = {
  input: CircularNode,
  output: CircularNode,
  default: CircularNode,
};

const ForceGraphComponent: React.FC = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedClassName, setSelectedClassName] = useState<string | null>(
    null
  );
  const {
    data: classDetails,
    isLoading: isClassDetailsLoading,
    isError: isClassDetailsError,
  } = useQuery(
    ["classDetails", selectedClassName],
    () =>
      axios
        .get(
          `http://localhost:3001/api/class-details?className=${selectedClassName}`
        )
        .then((res) => res.data),
    {
      enabled: !!selectedClassName, // only fetch when selectedClassName is not null
      staleTime: 1000 * 60 * 10, // 10 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    }
  );

  const onConnect = useCallback(
    (params: Edge<any> | Connection) =>
      setEdges((eds) => {
        const edge = addEdge(params, eds);
        const edgeProperty = {
          markerEnd: {
            type: MarkerType.Arrow,
          },
          label: "hasAction",
        };
        if (edge.length > 0 && typeof edge[edge.length - 1] === "object") {
          edge[edge.length - 1] = { ...edge[edge.length - 1], ...edgeProperty };
        }
        return edge;
      }),
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
        sourcePosition: "right",
        targetPosition: "left",
        data: { label: type },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  const {
    data: classes,
    isLoading,
    error: classesError,
  } = useQuery(
    "classes",
    () =>
      axios.get("http://localhost:3001/api/classes").then((res) => res.data),
    {
      staleTime: 1000 * 60 * 5, //5 minutes
    }
  );

  const renderClasses = () => {
    if (classesError) {
      return (
        <tds-banner
          variant="error"
          header="Error"
          subheader="Error Fetching classes from stardog"
        >
          <tds-link slot="actions">
            <a href="/">Link example</a>
          </tds-link>
        </tds-banner>
      );
    }
    if (isLoading) {
      return <tds-spinner size="lg" variant="standard"></tds-spinner>;
    }
    return (
      <div className={styles.chips}>
        {classes.map(
          (
            item: { parentClassUri: string; className: string },
            index: number
          ) => {
            return (
              <tds-chip
                type="button"
                size="lg"
                draggable
                key={index}
                onDragStart={(e: any) => handleOnDrag(e, item.className)}
                className={styles.chip}
              >
                <span slot="label">{item.className}</span>
              </tds-chip>
            );
          }
        )}
      </div>
    );
  };

  function handleOnDrag(e: React.DragEvent, nodeType: any) {
    e.dataTransfer.setData("application/reactflow", nodeType);
    e.dataTransfer.effectAllowed = "move";
  }

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    setSelectedClassName(node.data.label.replace(/\s+/g, ""));

    if (isLoading) {
      console.log("Loading class details...");
    }

    if (isClassDetailsError) {
      console.error("Error fetching class details");
    }

    console.log("Fetched class details:", classDetails);
  };

  return (
    <div className={styles.page}>
      <header className={styles.page__header}>
        <h1 className={styles.page__heading}>Store suppliers SSIP</h1>
      </header>
      <main className={styles.page__main}>
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebar__primaryHeading}>Library</h2>
          <h3 className={styles.sidebar__secondaryHeading}>Primary Classes</h3>
          <p className={styles.sidebar__description}>
            Select and add nodes to start designing your orchestration flow
            graph
          </p>
          <div className={styles.sidebar__tabs}>{/* Tabs go here */}</div>
          <div className={styles.sidebar__chips}>{renderClasses()}</div>
        </aside>
        <section className={styles.graph__canvas}>
          <div>
            <ReactFlowProvider>
              <div
                className="reactflow-wrapper"
                ref={reactFlowWrapper}
                style={{
                  height: "calc(100vh - 200px)",
                  width: "calc(100vw - 450px)",
                }}
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
                  onNodeClick={handleNodeClick}
                  nodeTypes={nodeTypes}
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
