import { GraphBody } from "@/services/graphSchema";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "react-query";
import ReactFlow, {
  addEdge,
  Background,
  Connection,
  Controls,
  Edge,
  Node,
  ReactFlowProvider,
  useEdgesState,
  useKeyPress,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";
import CircularNode from "../../components/CircularNode.tsx";
import {
  assignClassData,
  generateClassId,
  IClassConfig,
  setEdgeProperties,
} from "@/utils";
import DynamicForm from "./DynamicForm";
import styles from "./ofd.module.scss";

const initialNodes = [
  {
    id: generateClassId(),
    type: "input",
    data: {
      label: "Task",
      classData: {
        "@type": ["owl:NamedIndividual", "iris:Task"],
        "rdfs:label": "TaskLabel",
      },
    },
    position: { x: 0, y: 0 },
    sourcePosition: "right",
  },
];

const nodeTypes = {
  input: CircularNode,
  output: CircularNode,
  default: CircularNode,
};

const ForceGraphComponent: React.FC = ({ apiBaseUrl }: any) => {
  const reactFlowWrapper = useRef(null);
  //@ts-ignore
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isPendingClassDetailsAction, setIsPendingClassDetailsAction] =
    useState(false);

  const router = useRouter();
  const deletePressed = useKeyPress(["Delete"]);
  const [dropInfo, setDropInfo] = useState(null);
  const parseTtlMutation = useMutation((className: string) => {
    return axios.get(`${apiBaseUrl}/api/parse-ttl/?className=${className}`);
  });
  const [droppedClassName, setDroppedClassName] = useState(null);
  const {
    data: classDetails,
    isLoading: isClassDetailsLoading,
    isError: isClassDetailsError,
  } = useQuery(
    ["classDetails", droppedClassName],
    () =>
      axios
        .get(`${apiBaseUrl}/api/parse-ttl/?className=${droppedClassName}`)
        .then((res) => res.data),
    {
      enabled: !!droppedClassName, // only fetch when selectedClassName is not null
      staleTime: 1000 * 60 * 10, // 10 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    }
  );

  useEffect(() => {
    //closing the form when delete is pressed i.e node deleted
    setSelectedNode(null);
  }, [deletePressed]);
  const saveData = async (data: GraphBody) => {
    const response = await axios.post(`${apiBaseUrl}/api/persist`, data);
    return response.data;
  };

  const mutation = useMutation(saveData, {
    onSuccess: () => {
      setShowSuccessToast(true);
    },
    onError: (error) => {
      setShowErrorToast(true);
    },
  });

  useEffect(() => {
    let toastTimer: NodeJS.Timeout;

    if (showSuccessToast || showErrorToast) {
      toastTimer = setTimeout(() => {
        setShowSuccessToast(false);
        setShowErrorToast(false);
      }, 5000); // 5 seconds delay
    }

    return () => clearTimeout(toastTimer);
  }, [showSuccessToast, showErrorToast]);

  const handleSaveClick = () => {
    const payload = {
      nodes,
      edges,
      graphName: `http://example.org/${router.query?.graphName || "Private"}`,
    };
    mutation.mutate(payload);
  };

  const renderToasts = () => {
    return (
      <div className={styles.toast__absolute}>
        {showSuccessToast ? (
          <tds-toast
            variant="success"
            header="Graph Saved Successfully"
          ></tds-toast>
        ) : (
          <></>
        )}
        {showErrorToast ? (
          <tds-toast variant="error" header="Error Saving Graph"></tds-toast>
        ) : (
          <></>
        )}
      </div>
    );
  };

  const handleFormSubmit = useCallback(
    (data: any) => {
      if (!selectedNode) return;

      const updatedClassData: IClassConfig = {
        ...selectedNode.data.classData,
        ...data,
      };

      setNodes((prevNodes) =>
        prevNodes.map((node: Node) =>
          node.id === selectedNode.id
            ? { ...node, data: { ...node.data, classData: updatedClassData } }
            : node
        )
      );

      setSelectedNode(null);
    },
    [selectedNode, setNodes]
  );

  const onFormClose = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  const onConnect = useCallback(
    (params: Edge<any> | Connection) => {
      return setEdges((eds) => {
        const edge = addEdge(setEdgeProperties(nodes, params), eds);
        return edge;
      });
    },
    [nodes]
  );

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);
  // const onDrop = useCallback(
  //   (event: any) => {
  //     event.preventDefault();

  //     const type = event.dataTransfer.getData("application/reactflow");

  //     // check if the dropped element is valid
  //     if (typeof type === "undefined" || !type) {
  //       return;
  //     }
  //     setDroppedClassName(type.replace(/\s+/g, ""));

  //     const position = reactFlowInstance.screenToFlowPosition({
  //       x: event.clientX,
  //       y: event.clientY,
  //     });

  //     console.log("fetchedClass", classDetails);

  //     const newNode = {
  //       id: generateClassId(),
  //       type:
  //         type === "Task"
  //           ? "input"
  //           : type === "Result Action"
  //           ? "output"
  //           : "default",
  //       position,
  //       sourcePosition: "right",
  //       targetPosition: "left",
  //       data: {
  //         label: type,
  //         classData: assignClassData(type),
  //       },
  //     };
  //     //@ts-ignore
  //     setNodes((nds) => nds.concat(newNode));
  //   },
  //   [reactFlowInstance]
  // );
  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (typeof type === "undefined" || !type) {
        return;
      }
      const cleanedType = type.replace(/\s+/g, "");
      setDroppedClassName(cleanedType);

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Store event-related data for later use
      setDropInfo({
        type: type,
        position,
      });

      setIsPendingClassDetailsAction(true);
    },
    [reactFlowInstance]
  );

  useEffect(() => {
    if (classDetails && isPendingClassDetailsAction && dropInfo) {
      setIsPendingClassDetailsAction(false);

      // Access stored event data
      const { type, position } = dropInfo;

      const newNode = {
        id: generateClassId(),
        type:
          type === "Task"
            ? "input"
            : type === "Result Action"
            ? "output"
            : "default",
        position,
        sourcePosition: "right",
        targetPosition: "left",
        data: {
          label: type,
          classData: assignClassData(type),
          formData: classDetails,
        },
      };

      // Assuming setNodes updates your component state
      //@ts-ignore
      setNodes((nds) => nds.concat(newNode));

      // Clear dropInfo if necessary
      setDropInfo(null);
    }
  }, [classDetails, isPendingClassDetailsAction, dropInfo]);

  const {
    data: classes,
    isLoading,
    error: classesError,
  } = useQuery(
    "classes",
    () =>
      axios
        .get(`${apiBaseUrl}/api/classes`)
        .then((res) => [
          { uri: "", className: "Task", parentClassUri: "" },
          ...res.data,
        ]),
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
        {classes &&
          classes.map(
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
    setSelectedNode(node);
  };

  return (
    <div className={styles.page}>
      <header className={styles.page__header} style={{ height: "70px" }}>
        <h1 className={styles.page__heading}>
          {router.query?.graphName || ""}
        </h1>
        <div>
          {mutation.isLoading ? (
            <div style={{ marginRight: "25px" }}>
              <tds-spinner size="md" variant="standard"></tds-spinner>
            </div>
          ) : (
            <tds-button
              type="button"
              variant="primary"
              size="lg"
              text="Save"
              onClick={handleSaveClick}
            >
              <tds-icon slot="icon" size="20px" name="save"></tds-icon>
            </tds-button>
          )}
        </div>
      </header>
      <main className={styles.page__main}>
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebar__primaryHeading}>Library</h2>
          <h3 className={styles.sidebar__secondaryHeading}>Primary Classes</h3>
          <p className={styles.sidebar__description}>
            Select and add nodes to start designing your orchestration flow
            graph
          </p>
          <tds-divider orientation="horizontal"></tds-divider>
          <div className={styles.sidebar__tabs}>{/* Tabs go here */}</div>
          <div className={styles.sidebar__chips} style={{ marginTop: "10px" }}>
            {renderClasses()}
          </div>
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
                  position: "relative",
                }}
              >
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  deleteKeyCode={"Delete"}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onInit={setReactFlowInstance}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  fitView
                  onNodeClick={handleNodeClick}
                  nodeTypes={nodeTypes}
                  className="react-flow"
                >
                  <Controls />
                  {/* @ts-ignore */}
                  <Background />
                </ReactFlow>
                {selectedNode ? (
                  <div className={styles.form}>
                    <DynamicForm
                      key={selectedNode.id}
                      classConfig={selectedNode.data?.classData}
                      formData={selectedNode.data?.formData}
                      onSubmit={handleFormSubmit}
                      onClose={onFormClose}
                      label={selectedNode.data.label}
                      excludeKeys={["@id", "@type", "iris:hasAction"]}
                    />
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </ReactFlowProvider>
          </div>
        </section>
      </main>
      {renderToasts()}
    </div>
  );
};

export default ForceGraphComponent;
