import React, { useState, useEffect } from "react";
import { getSession } from "next-auth/react";
import Link from "next/link";
import axios from "axios";
import styles from "./ExecuteFlow.module.scss";
import Panel from "@/components/Tabs/Panel";
import Tabs from "@/components/Tabs/Tabs";
import { TdsDropdown, TdsDropdownOption } from "@scania/tegel-react";
import { Parameter as ParameterTemplate } from "@/utils/types";
import JsonView from "@uiw/react-json-view";
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
  const [selectedExecutionMethod, setSelectedExecutionMethod] =
    useState("Create");
  console.log("parameterTemplte", taskTemplate);
  // Creating a new parameter object
  const [newParameter, setNewParameter] = useState({
    name: "",
    value: "",
    iri: "iri",
  });
  // The result of the execution
  const [result, setResult] = useState();
  // Boolean to enable/disable editing of the parameter
  const [enableEditParameter, setEnableEditParameter] = useState(false);
  const [selectedParameter, setSelectedParameter] = useState({
    id: "",
    name: "",
    value: "",
  });
  const isValidJson = (value) => {
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

  // Placeholder parameters, should be replaced with real parameters
  const [parameters, setParameters] = useState<Parameter[]>(initParameters);

  // Save/Create a new parameter
  const saveParameter = async () => {
    try {
      const response = await axios.post("/api/parameter", {
        name: newParameter.name,
        value: newParameter.value,
        iri,
      });
      alert(`Parameter saved with ID: ${response.data.id}`);
      const parametersResponse = await axios.get(`/api/parameters`, {
        params: { iri },
      });
      setParameters(parametersResponse.data);
    } catch (error) {
      alert("An error occurred while saving the parameter.");
    }
  };

  const fetchParameters = async () => {
    const parametersResponse = await axios.get(`/api/parameters`, {
      params: { iri },
    });
    setParameters(parametersResponse.data);
  };

  const deleteParameter = async () => {
    try {
      const response = await axios.delete(
        `/api/parameter?id=${selectedParameter.id}`
      );
      alert(`Parameter deleted`);
      const parametersResponse = await axios.get(`/api/parameters`, {
        params: { iri },
      });
      setParameters(parametersResponse.data);
    } catch (error) {
      alert("An error occurred while deleting the parameter.");
    }
  };

  // Save an existing parameter with a new value
  const saveEditedParameter = () => {
    console.log(selectedParameter, "selected Parameter after Edit");
    alert("You have edited a parameter and saved it");
  };

  // Save the execution result
  const saveExecutionResult = () => {
    alert("Execution result has been saved");
  };

  // Selection of a existing parameter
  const selectParameter = (selectedParameterName) => {
    const parameter = parameters.find(
      (param) => param.name == selectedParameterName
    );
    // TODO - Figure out how to handle object in dropdown change
    setSelectedParameter({
      id: parameter?.id || "",
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
          parameters: JSON.parse(selectedParameter.value),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setResult(response.data);
      // Show the result in the modal
      (
        document.querySelector(
          `[selector="execution-result-modal"]`
        ) as HTMLTdsModalElement
      ).showModal();
    } catch (error) {
      console.log("error1");
      // setResult(`Failed to execute graph! Error: ${error.message}`);
    }
  };

  return (
    <div>
      {/* TODO - create component out of this navbar, its used in graph editor aswell */}
      <div className={styles.nav}>
        <Link href="/">
          <span>Graph editor</span>
          <tds-icon
            slot="icon"
            style={{ marginLeft: "8px" }}
            size="14px"
            name="back"
          ></tds-icon>
        </Link>
      </div>
      <div className={styles.main}>
        <hr className="divider" />
        <div className={styles.headerContainer}>
          <h3 className="tds-headline-03" style={{ marginBottom: "16px" }}>
            Execution flow
          </h3>
          <div className={styles.headerContainer__detailsContainer}>
            <div className="tds-detail-02">
              Graph name:{" "}
              <span className="bold"> Placeholder for graph name</span>
            </div>
            <div className="tds-detail-02">
              User: <span className="bold">Placeholder for user </span>
            </div>
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
                      }}
                      checked="true"
                    >
                      <div slot="label">Create new parameter</div>
                    </tds-radio-button>

                    <tds-radio-button
                      name="rb-example"
                      onClick={(e) => {
                        parameters.length && setSelectedExecutionMethod("Existing")
                      }}
                      disabled={!parameters.length}
                      value="savedParams"
                      radio-id="execute"
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
                        <div className={styles.contentContainer__parameterContainer__saveBtn}>
                        <tds-button
                          text="Save"
                          size="sm"
                          onClick={() => saveParameter()}
                        ></tds-button>
                        </div>

                      </div>
                      <tds-textarea
                        label="JSON"
                        rows="10"
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
                          label="Parameter name"
                          label-position="outside"
                          placeholder="Placeholder"
                          size="lg"
                          multiselect={false}
                          onTdsChange={(e) => {
                            selectParameter(e.detail.value);
                          }}
                          filter
                          open-direction="auto"
                          normalizeText={true}
                        >
                          {parameters.map((parameter, index) => {
                            return (
                              <TdsDropdownOption
                                value={parameter.name}
                                key={index}
                              >
                                {parameter.name}
                              </TdsDropdownOption>
                            );
                          })}
                        </TdsDropdown>
                      </div>
                      <tds-textarea
                        label="JSON"
                        rows="10"
                        disabled
                        label-position="outside"
                        onInput={(e) =>
                          setNewParameter({
                            ...newParameter,
                            value: e.target.value,
                          })
                        }
                        value={selectedParameter.value}
                      ></tds-textarea>
                    </>
                  )}
                </div>
              )}
              {selectedTab === "Results" && <div>Results</div>}
              <div className={styles.footerContainer}>
                <tds-button
                  text="Execute"
                  onClick={() => executeGraph()}
                ></tds-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <tds-modal selector="execution-result-modal" size="sm">
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
    </div>
  );
}

export default ExecuteFlow;
