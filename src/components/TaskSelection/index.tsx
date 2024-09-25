import React, { useEffect, useState } from "react";
import axios from "axios";
import { Task } from "@/utils/types";
import {
  TdsDropdown,
  TdsDropdownOption,
  TdsTextarea,
} from "@scania/tegel-react";

interface ExecuteGraphModalProps {
  executeGraphIriValue: string;
  baseUrl: string;
  setExecuteGraphIriValue: (value: string) => void;
  errorsExecuteGraph: any;
  registerExecuteGraph: any;
  handleSubmitExecuteGraph: any;
  handleExecute: () => void;
  theme: string;
  handleModalClose: () => void;
}

const ExecuteGraphModal: React.FC<ExecuteGraphModalProps> = ({
  handleSubmitExecuteGraph,
  handleExecute,
  handleModalClose,
  baseUrl,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/execute/tasks`);
        setTasks(response.data.tasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, [baseUrl]);
  const renderTaskSelector = () => {
    return (
      <TdsDropdown
        name="dropdown"
        label="Label"
        label-position="outside"
        placeholder="Placeholder"
        size="lg"
        multiselect={false}
        onTdsChange={(e) => {
          console.log(e, "tds change");
          const selectedTaskValue = e.detail.value;
          const selectedTask = tasks.find(
            (task) => task.label === selectedTaskValue
          );
          setSelectedTask(selectedTask as Task);
        }}
        filter
        open-direction="auto"
        normalizeText={true}
      >
        {tasks.map((task) => {
          return (
            <TdsDropdownOption value={task.label} key={task.label}>
              {task.label}
            </TdsDropdownOption>
          );
        })}
      </TdsDropdown>
    );
  };
  const renderTaskDetails = () => {
    if (!selectedTask) return <></>;
    return (
      <div style={{ marginTop: "15px" }}>
        <h6>IRI</h6>
        <p>{selectedTask?.subjectIri}</p>
      </div>
    );
    // return (
    //   <div style={{ marginTop: "15px" }}>
    //     <TdsTextarea
    //       type="text"
    //       size="lg"
    //       mode-variant="primary"
    //       state="default"
    //       label="IRI"
    //       label-position="outside"
    //       value={selectedTask.subjectIri}
    //       no-min-width
    //       readOnly
    //     ></TdsTextarea>
    //   </div>
    // );
  };
  return (
    <tds-modal
      id="execute-graph-iri-modal"
      tds-close={() => handleModalClose()}
      selector="#execute-graph-button"
      size="md"
    >
      <h5 className="tds-modal-headline" slot="header">
        Execute Graph with IRI
      </h5>
      <span slot="body">
        <div>
          <div style={{ height: "250px" }}>
            {renderTaskSelector()}
            {renderTaskDetails()}
          </div>
          <div style={{ marginTop: "28px" }} />
          <span slot="actions">
            <tds-button
              onClick={() => handleExecute(selectedTask)}
              size="md"
              text="Execute"
              modeVariant="primary"
            />
          </span>
        </div>
      </span>
    </tds-modal>
  );
};

export default ExecuteGraphModal;
