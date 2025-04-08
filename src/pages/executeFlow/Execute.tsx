import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import styles from "./ExecuteFlow.module.scss";
import Tabs from "@/components/Tabs/Tabs";
import Tab from "@/components/Tabs/Tab";
import Modal from "@/components/Modal/CustomModal";
import ExecutionLog from "@/components/ExecutionLog/ExecutionLog";
import { isValidJson } from "@/helpers/helper";
import { TdsDropdown, TdsDropdownOption } from "@scania/tegel-react";
import { Parameter as ParameterTemplate } from "@/utils/types";
import { useToast } from "@/hooks/useToast";
import { useForm } from "react-hook-form";
import ActionToolbar from "@/components/ActionToolbar/ActionToolbar";
import ExecutionResult from "@/components/ExecutionResult/ExecutionResult";
import ExecutionResults from "./ExecutionResults";
import Tooltip from "@/components/Tooltip/Tooltip";

interface Parameter {
  id?: string;
  name: string;
  value: string;
}

interface ExecuteProp {
  iri: string;
  baseUrl: string;
  initParameters: Parameter[];
  taskTemplate: ParameterTemplate[];
}

const ExecuteFlow: React.FC<ExecuteProp> = ({
  iri,
  baseUrl,
  initParameters = [],
  taskTemplate = [],
}) => {
  const [activeTab, setActiveTab] = useState<string>("execution");
  const [executionType, setExecutionType] = useState<string>("sync");
  const [exectionLogModalIsOpen, setExectionLogModalIsOpen] = useState(false);
  const [parameters, setParameters] = useState<Parameter[]>(initParameters);
  const [executionResultModalIsOpen, setExecutionResultModalIsOpen] =
    useState(false);
  const [selectedExecutionMethod, setSelectedExecutionMethod] = useState<
    "Create" | "Existing" | "Editing"
  >(() => (parameters.length > 0 ? "Existing" : "Create"));
  const [selectedParameter, setSelectedParameter] = useState<Parameter | null>(
    null
  );
  const [executionResult, setExecutionResult] = useState("");
  const [executionLog, setExecutionLog] = useState([]);
  const [dropdownKey, setDropdownKey] = useState(0);
  const { showToast, clearToasts } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<Parameter>({
    defaultValues: {
      name: "",
      value: JSON.stringify(taskTemplate, null, 2),
    },
  });

  const fetchParameters = useCallback(async () => {
    try {
      const response = await axios.get<Parameter[]>(`/api/parameters`, {
        params: { iri },
      });
      setParameters(response.data);
      return response.data;
    } catch (error) {
      showToast("error", "Error", "Failed to fetch parameters.");
      return [];
    }
  }, [iri]);

  useEffect(() => {
    fetchParameters();
  }, [fetchParameters]);

  useEffect(() => {
    if (selectedExecutionMethod === "Create") {
      reset({
        name: "",
        value: JSON.stringify(taskTemplate, null, 2),
      });
      setSelectedParameter(null);
    } else if (selectedExecutionMethod === "Existing" && selectedParameter) {
      reset({
        name: selectedParameter.name,
        value: selectedParameter.value,
      });
    }
  }, [selectedExecutionMethod, reset, selectedParameter, taskTemplate]);

  const saveParameter = async (data: Parameter) => {
    try {
      const response = await axios.post("/api/parameter", {
        name: data.name,
        value: data.value,
        iri,
      });
      const savedParameter = response.data;
      await fetchParameters();
      showToast("success", "Success", "Parameter saved successfully.", 2000);
      reset({
        name: "",
        value: JSON.stringify(taskTemplate, null, 2),
      });
      setSelectedExecutionMethod("Existing");
      setSelectedParameter(savedParameter);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "The parameter set could not be saved.";
      showToast("error", "Error", errorMessage, 2000);
    }
  };

  const saveEditedParameter = async (data: Parameter) => {
    try {
      if (selectedParameter?.id) {
        await axios.put(
          `/api/parameter`,
          { value: data.value },
          { params: { id: selectedParameter.id } }
        );
        const updatedParameters = await fetchParameters();
        const updatedParameter = updatedParameters.find(
          (p) => p.id === selectedParameter.id
        );
        if (updatedParameter) {
          setSelectedParameter(updatedParameter);
        }
        showToast(
          "success",
          "Success",
          `Parameter updated successfully.`,
          2000
        );
        setSelectedExecutionMethod("Existing");
      }
    } catch (error) {
      console.error("Error updating parameter:", error);
      showToast(
        "error",
        "Error",
        "An error occurred while editing the parameter.",
        2000
      );
    }
  };

  const deleteParameter = async () => {
    try {
      if (selectedParameter?.id) {
        await axios.delete(`/api/parameter`, {
          params: { id: selectedParameter.id },
        });
        const updatedParameters = await fetchParameters();
        setSelectedParameter(null);
        setDropdownKey((prev) => prev + 1); // update key to force re-render due to tds uncontrolled component
        reset({
          name: "",
          value: JSON.stringify(taskTemplate, null, 2),
        });
        showToast(
          "success",
          "Success",
          "Parameter deleted successfully.",
          2000
        );
        // If there are no saved parameters, switch to "Create" mode.
        if (!updatedParameters.length) {
          setSelectedExecutionMethod("Create");
          setSelectedParameter(null);
          reset({
            name: "",
            value: JSON.stringify(taskTemplate, null, 2),
          });
        }
      }
    } catch {
      showToast(
        "error",
        "Error",
        "An error occurred while deleting the parameter.",
        2000
      );
    }
  };

  const selectParameter = (selectedParameterId: string) => {
    const parameter = parameters.find(
      (param) => param.id === selectedParameterId
    );
    if (parameter) {
      setSelectedParameter(parameter);
      reset({
        name: parameter.name,
        value: parameter.value,
      });
    }
  };

  const handleShowMore = (executionIdHeader: string) => async () => {
    clearToasts();
    setExectionLogModalIsOpen(true);
    try {
      const response = await axios.get(
        `${baseUrl}/api/execute/logs?executionId=${encodeURI(
          executionIdHeader
        )}`
      );
      setExecutionLog(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const executeGraph = async () => {
    switch (executionType) {
      case "sync": {
        try {
          const response = await axios.post(
            `${baseUrl}/api/execute/sync`,
            {
              subjectIri: iri,
              parameters: JSON.parse(selectedParameter?.value || "{}"),
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          setExecutionResultModalIsOpen(true);
          setExecutionResult(response.data);
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.error ||
            error.message ||
            "Could not execute graph";
          let executionIdHeader: string | null = null;
          if (error.response?.headers?.["execution-id"]) {
            executionIdHeader = error.response.headers["execution-id"];
            showToast(
              "error",
              "Error",
              errorMessage,
              3500,
              handleShowMore(executionIdHeader)
            );
            return;
          }
          showToast("error", "Error", errorMessage, 2000);
        }
        break;
      }
      case "async": {
        try {
          const response = await axios.post(
            `${baseUrl}/api/execute/async`,
            {
              subjectIri: iri,
              parameters: JSON.parse(selectedParameter?.value || "{}"),
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          showToast(
            "information",
            "Execution Started",
            `Result Graph: ${response.data.resultGraphURI}`,
            3500
          );
        } catch (error) {
          const errorMessage =
            error.response?.data?.error ||
            error.message ||
            "Could not execute graph asynchronously";
          let executionIdHeader = null;
          if (error.response?.headers?.["execution-id"]) {
            executionIdHeader = error.response.headers["execution-id"];
            showToast(
              "error",
              "Error",
              errorMessage,
              3500,
              handleShowMore(executionIdHeader)
            );
            return;
          }
          showToast("error", "Error", errorMessage, 2000);
        }
        break;
      }
      default: {
        console.warn("Unknown execution type");
        break;
      }
    }
  };

  return (
    <div>
      <ActionToolbar />
      <div className={styles.main}>
        <div className={styles.headerContainer}>
          <h3 className="tds-headline-03" style={{ marginBottom: "16px" }}>
            Execution flow
          </h3>
          <div className={styles.headerContainer__detailsContainer}>
            <div className="tds-detail-02">
              IRI: <span className="bold">{iri}</span>
            </div>
          </div>
        </div>

        <div className={styles.tabs}>
          <Tabs onTabChange={setActiveTab} activeTab={activeTab}>
            <Tab label={"Execution"} tabKey="execution">
              <div className={styles.outerContentContainer}>
                <div className={styles.contentContainer}>
                  <div>
                    <h6 className="tds-headline-06">Execute parameter</h6>
                    <hr className="divider" />

                    {/* Execution Method Selection */}
                    <div className={styles.contentContainer__parameterChoice}>
                      <tds-radio-button
                        name="select-parameter-method"
                        value="Create"
                        radio-id="create"
                        onClick={() => setSelectedExecutionMethod("Create")}
                        checked={selectedExecutionMethod === "Create"}
                      >
                        <div slot="label">Create new parameter set</div>
                      </tds-radio-button>

                      <tds-radio-button
                        name="select-parameter-method"
                        value="Existing"
                        radio-id="existing"
                        onClick={() =>
                          parameters.length &&
                          setSelectedExecutionMethod("Existing")
                        }
                        disabled={!parameters.length}
                        checked={
                          selectedExecutionMethod === "Existing" ||
                          selectedExecutionMethod === "Editing"
                        }
                      >
                        <div slot="label">Saved parameter sets</div>
                      </tds-radio-button>
                    </div>

                    {/* Create New Parameter set */}
                    {selectedExecutionMethod === "Create" && (
                      <form onSubmit={handleSubmit(saveParameter)}>
                        <div
                          className={
                            styles.contentContainer__parameterContainer
                          }
                        >
                          <tds-text-field
                            placeholder="New name"
                            label="Parameter set name"
                            size="sm"
                            label-position="outside"
                            helper={errors.name?.message || ""}
                            state={errors.name ? "error" : "default"}
                            value={watch("name")}
                            onInput={(e) =>
                              setValue(
                                "name",
                                (e.target as HTMLInputElement).value
                              )
                            }
                            {...register("name", {
                              required: "Parameter set name is required",
                              pattern: {
                                value:
                                  /^[^\s!@#$%^&*()+=\[\]{};':"\\|,.<>\/?]*$/,
                                message:
                                  "Name cannot contain spaces or special characters",
                              },
                            })}
                          />
                          <div
                            className={
                              styles.contentContainer__parameterContainer__saveBtn
                            }
                          >
                            <tds-button
                              disabled={!watch("name") || !watch("value")}
                              type="submit"
                              text="Save"
                              size="sm"
                            ></tds-button>
                          </div>
                        </div>
                        <tds-textarea
                          label="JSON"
                          rows={12}
                          label-position="outside"
                          helper={errors.value?.message || ""}
                          state={errors.value ? "error" : "default"}
                          value={watch("value")}
                          onInput={(e) =>
                            setValue(
                              "value",
                              (e.target as HTMLTextAreaElement).value
                            )
                          }
                          {...register("value", {
                            required: "Parameter set value is required",
                            validate: (value) =>
                              isValidJson(value) ? true : "Invalid JSON",
                          })}
                        ></tds-textarea>
                      </form>
                    )}
                    {/* Existing Parameters */}
                    {(selectedExecutionMethod === "Existing" ||
                      selectedExecutionMethod === "Editing") && (
                        <>
                          <div
                            className={
                              styles.contentContainer__parameterContainer
                            }
                          >
                            <TdsDropdown
                              name="dropdown"
                              key={dropdownKey}
                              label="Select Parameter Set"
                              label-position="outside"
                              placeholder="Select parameter set"
                              size="sm"
                              multiselect={false}
                              onTdsChange={(e) => selectParameter(e.detail.value)}
                              open-direction="auto"
                              normalizeText={true}
                              defaultValue={selectedParameter?.id}
                            >
                              {parameters.map((parameter) => (
                                <TdsDropdownOption
                                  value={parameter.id}
                                  key={parameter.id}
                                >
                                  {parameter.name}
                                </TdsDropdownOption>
                              ))}
                            </TdsDropdown>
                            {selectedParameter && (
                              <>
                                <tds-button
                                  text={
                                    selectedExecutionMethod === "Editing"
                                      ? "Save"
                                      : "Edit"
                                  }
                                  size="sm"
                                  onClick={
                                    selectedExecutionMethod === "Editing"
                                      ? handleSubmit(saveEditedParameter)
                                      : () =>
                                        setSelectedExecutionMethod("Editing")
                                  }
                                ></tds-button>

                                <tds-button
                                  text="Delete"
                                  size="sm"
                                  variant="secondary"
                                  onClick={deleteParameter}
                                ></tds-button>
                              </>
                            )}
                          </div>

                          <tds-textarea
                            label="JSON"
                            rows={12}
                            label-position="outside"
                            disabled={selectedExecutionMethod !== "Editing"}
                            helper={errors.value?.message || ""}
                            state={errors.value ? "error" : "default"}
                            value={watch("value")}
                            onInput={(e) =>
                              selectedExecutionMethod === "Editing" &&
                              setValue(
                                "value",
                                (e.target as HTMLTextAreaElement).value
                              )
                            }
                            {...(selectedExecutionMethod === "Editing"
                              ? register("value", {
                                required: "Parameter set value is required",
                                validate: (value) =>
                                  isValidJson(value) ? true : "Invalid JSON",
                              })
                              : {})}
                          ></tds-textarea>
                        </>
                      )}

                    {/* Execute Button */}

                    {selectedParameter &&
                      selectedExecutionMethod === "Existing" && (
                        <div className={styles.footerContainer}>
                          <Tooltip
                            content="A synchronous execution shows the result without storing it"
                            direction="top"
                          >
                            <tds-radio-button
                              name="select-execute-type"
                              value="sync"
                              radio-id="sync"
                              onClick={() => setExecutionType("sync")}
                              checked={executionType === "sync"}
                            >
                              <div slot="label">Synchronous</div>
                            </tds-radio-button>
                          </Tooltip>
                          <Tooltip
                            content="An asynchronous execution stores the result and is a good option when there are multiple data sources"
                            direction="top"
                          >
                            <tds-radio-button
                              name="select-execute-type"
                              value="async"
                              radio-id="async"
                              onClick={() => setExecutionType("async")}
                              checked={executionType === "async"}
                            >
                              <div slot="label">Asynchronous</div>
                            </tds-radio-button>
                          </Tooltip>
                          <tds-button
                            text="Execute"
                            onClick={executeGraph}
                          ></tds-button>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </Tab>
            <Tab label={"Results"} tabKey="results">
              <ExecutionResults iri={iri} />
            </Tab>
          </Tabs>
        </div>
      </div>

      <Modal
        isOpen={executionResultModalIsOpen}
        onRequestClose={() => setExecutionResultModalIsOpen(false)}
        title="Graph execution result"
      >
        <ExecutionResult executionResult={executionResult} />
      </Modal>

      <Modal
        isOpen={exectionLogModalIsOpen}
        onRequestClose={() => setExectionLogModalIsOpen(false)}
        title="Graph execution log"
      >
        <ExecutionLog executionLog={executionLog} />
      </Modal>

    </div>
  );
};

export default ExecuteFlow;
