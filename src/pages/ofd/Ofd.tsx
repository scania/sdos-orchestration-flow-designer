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
import { useMutation, useQuery } from "react-query";
import CircularNode from "../../components/CircularNode.tsx";
import { GraphBody } from "@/services/graphSchema";
import { assignClassData, generateJsonLdFromState } from "../../utils";
import { useRouter } from "next/router";
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const initialNodes = [
  {
    id: "1",
    type: "input",
    data: {
      label: "Task",
      classData: {
        "@id": "iris:aeca5978_21af_4c8d_af8f_f2e68e2a3417",
        "@type": ["owl:NamedIndividual", "iris:Task"],
        "iris:hasAction": {
          "@id": "iris:301acd01_19b5_4f19_ab76_ee13ffb57c00",
        },
        "rdfs:label": "GetPizzasAndAllergenes",
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

const ForceGraphComponent: React.FC = () => {
  const reactFlowWrapper = useRef(null);
  //@ts-ignore
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedClassName, setSelectedClassName] = useState<string | null>(
    null
  );
  const router = useRouter();
  const {
    data: classDetails,
    isLoading: isClassDetailsLoading,
    isError: isClassDetailsError,
  } = useQuery(
    ["classDetails", selectedClassName],
    () =>
      axios
        .get(`${baseUrl}/api/class-details?className=${selectedClassName}`)
        .then((res) => res.data),
    {
      enabled: !!selectedClassName, // only fetch when selectedClassName is not null
      staleTime: 1000 * 60 * 10, // 10 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    }
  );

  const saveData = async (data: GraphBody) => {
    const response = await axios.post(`${baseUrl}/api/persist`, data);
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
    if (showSuccessToast) {
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 5000); // 5 seconds delay
    }

    if (showErrorToast) {
      setTimeout(() => {
        setShowErrorToast(false);
      }, 5000); // 5 seconds delay
    }
  }, [showSuccessToast, showErrorToast]);

  const handleSaveClick = () => {
    const jsonLdPayload = generateJsonLdFromState({ nodes, edges });
    const payload = {
      dbName: `http://example.org/${router.query?.graphName || "Private"}`,
      graphData: jsonLdPayload,
    };
    console.log("payload", payload);
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
        data: { label: type, classData: assignClassData(type) },
      };
      //@ts-ignore
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
    () => axios.get(`${baseUrl}/api/classes`).then((res) => res.data),
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
      <header className={styles.page__header} style={{ height: "70px" }}>
        <h1 className={styles.page__heading}>
          {router.query?.graphName || ""}
        </h1>
        <div>
          {mutation.isLoading ? (
            <tds-spinner size="md" variant="standard"></tds-spinner>
          ) : (
            <tds-button
              type="button"
              variant="primary"
              size="lg"
              text="Save"
              onClick={handleSaveClick}
            ></tds-button>
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
      {renderToasts()}
    </div>
  );
};

export default ForceGraphComponent;
