import React, { useEffect, useState } from "react";
import axios from "axios";
import { Task } from "@/utils/types";
import Modal from "../Modal/CustomModal";
import { TdsButton, TdsDropdown, TdsDropdownOption } from "@scania/tegel-react";

interface ExecuteGraphModalProps {
  executeGraphIriValue: string;
  baseUrl: string;
  setExecuteGraphIriValue: (value: string) => void;
  errorsExecuteGraph: any;
  registerExecuteGraph: any;
  handleExecute: () => void;
  isExecuteGraphModalOpen: () => void;
  setIsExecuteGraphModalOpen: () => void;
  theme: string;
}

const ExecuteGraphModal: React.FC<ExecuteGraphModalProps> = ({
  handleExecute,
  isExecuteGraphModalOpen,
  setIsExecuteGraphModalOpen,
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

  const closeExecutionModal = () => {
    setIsExecuteGraphModalOpen(false);
    setSelectedTask(null);
  };

  const renderTaskSelector = () => {
    return (
      <TdsDropdown
        name="dropdown"
        label="Label"
        label-position="outside"
        placeholder="Select graph"
        size="lg"
        filter
        onTdsChange={(e) => {
          const selectedTaskValue = e.detail.value;
          const selectedTask = tasks.find(
            (task) => task.label === selectedTaskValue
          );
          setSelectedTask(selectedTask as Task);
        }}
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
  };
  return (
    <Modal
      isOpen={isExecuteGraphModalOpen}
      onRequestClose={() => closeExecutionModal()}
      title="Execute Graph with IRI"
      width={"lg"}
    >
      <div>
        <div style={{ height: "250px" }}>
          {renderTaskSelector()}
          {renderTaskDetails()}
        </div>
        <div style={{ marginTop: "28px" }} />
        <span slot="actions">
          <TdsButton
            onClick={() => handleExecute(selectedTask)}
            size="md"
            text="Execute"
            modeVariant="primary"
            disabled={!selectedTask}
          />
        </span>
      </div>
    </Modal>
  );
};

export default ExecuteGraphModal;
