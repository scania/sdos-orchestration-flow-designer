import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import styles from "./ExecuteFlow.module.scss";
import Panel from "@/components/Tabs/Panel";
import Tabs from "@/components/Tabs/Tabs";
import { TdsDropdown, TdsDropdownOption } from "@scania/tegel-react";
import { Parameter as ParameterTemplate } from "@/utils/types";
import JsonView from "@uiw/react-json-view";
import Toast, { ToastItem } from "@/components/Toast/Toast";
interface Parameter {
  id?: string;
  name: string;
  value: string;
}

interface ExecuteProp {
  iri: string;
  flowId: string | null;
  baseUrl: string;
  initParameters: any[];
  taskTemplate: ParameterTemplate[];
}

function ExecuteFlow({
  iri,
  flowId = null,
  baseUrl,
  initParameters = [],
  taskTemplate = [],
}: ExecuteProp) {
  const [selectedTab, setSelectedTab] = useState("Execution");
  const [listOfToasts, setListOfToasts] = useState<ToastItem[]>([]);
  const router = useRouter();
  const [selectedExecutionMethod, setSelectedExecutionMethod] = useState<
    "Create" | "Existing" | "Editing"
  >("Create");
  const [newParameter, setNewParameter] = useState<Parameter>({
    name: "",
    value: JSON.stringify(taskTemplate, null, 2),
  });
  const [result, setResult] = useState("");
  const [selectedParameter, setSelectedParameter] = useState<Parameter | null>(
    null
  );
  const [parameters, setParameters] = useState<Parameter[]>(initParameters);
  const isValidJson = (value: any) => {
    if (typeof value === "object") {
      return true;
    }
    try {
      JSON.parse(value);
      return true;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    fetchParameters();
  }, []);

  const showToast = (variant, header, description) => {
    const toastProperties = {
      variant,
      header,
      description,
    };
    setListOfToasts([...listOfToasts, toastProperties]);
  };

  // Save/Create a new parameter
  const saveParameter = async () => {
    try {
      const response = await axios.post("/api/parameter", {
        name: newParameter.name,
        value: newParameter.value,
        iri,
      });
      const parametersResponse = await axios.get(`/api/parameters`, {
        params: { iri },
      });
      setParameters(parametersResponse.data);
      showToast(
        "success",
        "Success",
        `Parameter saved with ID: ${response.data.id}`
      );
    } catch (error) {
      showToast("error", "Error", "The graph could not be saved");
    }
  };

  const fetchParameters = async () => {
    const parametersResponse = await axios.get(`/api/parameters`, {
      params: { iri },
    });
    setParameters(parametersResponse.data);
  };

  // TODO - Used to add event listener to modal, can probably be resolved with tegel/react
  useEffect(() => {
    let modal = document.querySelector("#execution-result-modal");
    modal.addEventListener("tdsClose", (event) => {
      handleModalClose();
    });
  }, []);

  const handleModalClose = () => {
    setResult("");
  };

  const deleteParameter = async () => {
    try {
      await axios.delete(`/api/parameter?id=${selectedParameter?.id}`);
      showToast("success", "Success", `Parameter Deleted`);
      const parametersResponse = await axios.get(`/api/parameters`, {
        params: { iri },
      });
      setParameters(parametersResponse.data);
      setSelectedExecutionMethod("Create");
    } catch (error) {
      showToast(
        "error",
        "Error",
        "An error occurred while deleting the parameter."
      );
    }
  };

  const resetEditParameterValue = () => {
    selectParameter(selectedParameter?.id || "");
    setSelectedExecutionMethod("Existing");
  };

  const saveEditedParameter = async () => {
    try {
      if (selectedParameter?.id) {
        const response = await axios.put(
          `/api/parameter/?id=${selectedParameter.id}`,
          {
            value: selectedParameter.value,
          }
        );
        showToast(
          "success",
          "Success",
          `Parameter updated with ID: ${response.data.id}`
        );
      }

      const parametersResponse = await axios.get(`/api/parameters`, {
        params: { iri },
      });
      setParameters(parametersResponse.data);
      setSelectedExecutionMethod("Existing");
    } catch (error) {
      showToast(
        "error",
        "Error",
        "An error occurred while editing the parameter."
      );
    }
  };

  const selectParameter = (selectedParameterId: string) => {
    const parameter = parameters.find(
      (param) => param.id == selectedParameterId
    );
    setSelectedParameter({
      id: parameter?.id,
      name: parameter?.name || "",
      value: parameter?.value || "",
    });
  };

  const executeGraph = async () => {
    try {
      // Make the POST request using async/await
      const response = await axios.post(
        `${baseUrl}/api/execute/sync`,
        {
          subjectIri: iri,
          parameters: JSON.parse(selectedParameter?.value as string),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // Show the result in the modal
      (
        document.querySelector(
          `[selector="execution-result-modal"]`
        ) as HTMLTdsModalElement
      ).showModal();
      setResult(response.data);
    } catch (error) {
      let errorMessage = "Could not execute graph";
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      showToast("error", "Error", errorMessage);
    }
  };

  return (
    <div>
      {/* TODO - create component out of this navbar, its used in graph editor aswell */}
      <div className={styles.nav}>
        <div onClick={router.back} className="pointer">
          <span>Back</span>
          <tds-icon
            slot="icon"
            style={{ marginLeft: "8px" }}
            size="14px"
            name="back"
          ></tds-icon>
        </div>
      </div>
      <div className={styles.main}>
        <hr className="divider" />
        <div className={styles.headerContainer}>
          <h3 className="tds-headline-03" style={{ marginBottom: "16px" }}>
            Execution flow
          </h3>
          <div className={styles.headerContainer__detailsContainer}>
            {/* feature to be added  */}
            {/* <div className="tds-detail-02">
              Graph name:{" "}
              <span className="bold"> Placeholder for graph name</span>
            </div>
            <div className="tds-detail-02">
              User: <span className="bold">Placeholder for user </span>
            </div> */}
            <div className="tds-detail-02">
              IRI: <span className="bold">{iri}</span>
            </div>
          </div>
        </div>
        <div className={styles.tabs}>
          <Tabs
            selectedIndex={selectedTab}
            onParentClick={(value: string) => setSelectedTab(value)}
          >
            {[<Panel title="Execution" value="Execution"></Panel>]}
            {/* Result tab hidden untill functionality added
              <Panel title="Results" value="Results"></Panel>
            */}
          </Tabs>
          <div className={styles.outerContentContainer}>
            <div className={styles.contentContainer}>
              {selectedTab === "Execution" && (
                <div>
                  <h6 className="tds-headline-06">Execute parameter</h6>
                  <hr className="divider" />
                  <div className={styles.contentContainer__parameterChoice}>
                    <tds-radio-button
                      name="rb-example"
                      value="newParam"
                      radio-id="create"
                      onClick={(e) => {
                        setSelectedExecutionMethod("Create");
                        setSelectedParameter(null);
                      }}
                      checked={selectedExecutionMethod === "Create"}
                    >
                      <div slot="label">Create new parameter</div>
                    </tds-radio-button>

                    <tds-radio-button
                      name="rb-example"
                      onClick={() => {
                        parameters.length &&
                          setSelectedExecutionMethod("Existing");
                      }}
                      disabled={!parameters.length}
                      value="savedParams"
                      radio-id="execute"
                      checked={
                        selectedExecutionMethod === "Editing" ||
                        selectedExecutionMethod === "Existing"
                      }
                    >
                      <div slot="label">Saved parameters</div>
                    </tds-radio-button>
                  </div>
                  {selectedExecutionMethod === "Create" && (
                    <>
                      <div
                        className={styles.contentContainer__parameterContainer}
                      >
                        <tds-text-field
                          placeholder="New name"
                          label="Parameter name"
                          size="sm"
                          label-position="outside"
                          value={newParameter.name}
                          onInput={(e) =>
                            setNewParameter({
                              ...newParameter,
                              name: e.target.value,
                            })
                          }
                        />
                        <div
                          className={
                            styles.contentContainer__parameterContainer__saveBtn
                          }
                        >
                          <tds-button
                            text="Save"
                            size="sm"
                            onClick={() => saveParameter()}
                          ></tds-button>
                        </div>
                      </div>
                      <tds-textarea
                        label="JSON"
                        rows={20}
                        label-position="outside"
                        onInput={(e) =>
                          setNewParameter({
                            ...newParameter,
                            value: e.target.value,
                          })
                        }
                        value={newParameter.value}
                      ></tds-textarea>
                    </>
                  )}
                  {selectedExecutionMethod === "Existing" && (
                    <>
                      <div
                        className={styles.contentContainer__parameterContainer}
                      >
                        <TdsDropdown
                          name="dropdown"
                          label="Select Parameter Set"
                          label-position="outside"
                          placeholder="Placeholder"
                          size="sm"
                          multiselect={false}
                          onTdsChange={(e) => {
                            selectParameter(e.detail.value);
                          }}
                          open-direction="auto"
                          normalizeText={true}
                          defaultValue={selectedParameter?.id}
                        >
                          {parameters.map((parameter) => {
                            return (
                              <TdsDropdownOption
                                value={parameter.id}
                                key={parameter.id}
                              >
                                {parameter.name}
                              </TdsDropdownOption>
                            );
                          })}
                        </TdsDropdown>
                        {selectedParameter && (
                          <>
                            <tds-button
                              text="Edit"
                              size="sm"
                              onClick={() => {
                                setSelectedExecutionMethod("Editing");
                              }}
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
                        rows={20}
                        disabled
                        label-position="outside"
                        onInput={(e) =>
                          setNewParameter({
                            ...newParameter,
                            value: e.target.value,
                          })
                        }
                        value={selectedParameter ? selectedParameter.value : ""}
                      ></tds-textarea>
                    </>
                  )}
                  {selectedExecutionMethod === "Editing" && (
                    <>
                      <div
                        className={styles.contentContainer__parameterContainer}
                      >
                        <tds-text-field
                          placeholder="New name"
                          label="Parameter name"
                          size="sm"
                          label-position="outside"
                          value={selectedParameter?.name}
                          disabled
                        />

                        {selectedParameter && (
                          <>
                            <tds-button
                              text="Save"
                              size="sm"
                              onClick={saveEditedParameter}
                            ></tds-button>
                            <tds-button
                              text="Cancel"
                              size="sm"
                              onClick={() => resetEditParameterValue()}
                            ></tds-button>
                          </>
                        )}
                      </div>
                      <tds-textarea
                        label="JSON"
                        rows={20}
                        label-position="outside"
                        onInput={(e: any) =>
                          selectedParameter &&
                          setSelectedParameter({
                            ...selectedParameter,
                            value: e.target.value,
                          })
                        }
                        value={selectedParameter ? selectedParameter.value : ""}
                      ></tds-textarea>
                    </>
                  )}
                </div>
              )}
              {selectedTab === "Results" && <div>Results</div>}
              {selectedParameter && selectedExecutionMethod === "Existing" && (
                <div className={styles.footerContainer}>
                  <tds-button
                    text="Execute"
                    onClick={() => executeGraph()}
                  ></tds-button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <tds-modal
        id="execution-result-modal"
        selector="execution-result-modal"
        size="sm"
        tds-close={() => handleModalClose()}
      >
        <h5 className="tds-modal-headline" slot="header">
          Execute Graph with IRI
        </h5>
        <span slot="body">
          {result && isValidJson(result) ? (
            // Show JsonView if result is valid JSON
            <JsonView
              value={result} // Parse the JSON for the JsonView component
              indentWidth={4}
              displayDataTypes={false}
              collapsed={false}
              displayObjectSize={true}
              enableClipboard={true}
              quotes={`"`}
            />
          ) : (
            // If not JSON, show the result as plain text
            <p>{result}</p>
          )}
        </span>
      </tds-modal>
      <Toast listOfToasts={listOfToasts} setListOfToasts={setListOfToasts} />
    </div>
  );
}

export default ExecuteFlow;
