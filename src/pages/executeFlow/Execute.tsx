import React, { useState } from "react";
import { getSession } from "next-auth/react";
import Link from "next/link";
import axios from "axios";
import styles from "./ExecuteFlow.module.scss";
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
  // The mode changes between "initial, editParameter and existingParameter"
  const [mode, setMode] = useState("initial");
  const initNewParameter = {
    name: "parameter",
    value: JSON.stringify(taskTemplate),
  };
  const [creatingNewParameter, setCreatingNewParameter] =
    useState<Parameter>(initNewParameter);
  const [result, setResult] = useState({});
  const [enableEditParameter, setEnableEditParameter] = useState(false);
  const [selectedParameter, setSelectedParameter] = useState({
    id: "",
    name: "",
    value: "",
  });
  const encodedIri = Buffer.from(iri).toString("base64");

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

  // Placeholder parameters, should be replaced with real parameters
  const [parameters, setParameters] = useState<Parameter[]>(initParameters);

  // Save/Create a new parameter
  const saveParameter = async () => {
    try {
      const response = await axios.post("/api/parameter", {
        name: creatingNewParameter.name,
        value: creatingNewParameter.value, // Assuming 'value' is part of creatingNewParameter
        iri,
      });
      alert(`Parameter saved with ID: ${response.data.id}`);
      const parametersResponse = await axios.get(`/api/parameters`, {
        params: { encodedIri },
      });
      setParameters(parametersResponse.data);
      changeMode("initial");
    } catch (error) {
      alert("An error occurred while saving the parameter.");
    }
  };

  const deleteParameter = async () => {
    try {
      const response = await axios.delete(
        `/api/parameter?id=${selectedParameter.id}`
      );
      alert(`Parameter deleted`);
      const parametersResponse = await axios.get(`/api/parameters`, {
        params: { encodedIri },
      });
      setParameters(parametersResponse.data);
      changeMode("initial");
    } catch (error) {
      alert("An error occurred while deleting the parameter.");
    }
  };

  // Change mode, reset certain options
  const changeMode = (mode) => {
    setCreatingNewParameter(initNewParameter);
    setMode(mode);
  };

  // Save an existing parameter with a new value
  const saveEditedParameter = () => {
    alert("You have edited a parameter and saved it");
  };

  // Save the execution result
  const saveExecutionResult = () => {
    alert("Execution result has been saved");
  };

  // Selection of a existing parameter
  const selectParameter = (param) => {
    setSelectedParameter({
      id: param.id,
      name: param.name,
      value: param.value,
    });
    changeMode("existingParameter");
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

      const result = response.data;
      // Show the result in the modal
      (
        document.querySelector(
          `[selector="execution-result-modal"]`
        ) as HTMLTdsModalElement
      ).showModal();
      setResult(result);
    } catch (error) {
      (
        document.querySelector(
          `[selector="execution-result-modal"]`
        ) as HTMLTdsModalElement
      ).showModal();
      setResult(`Failed to execute graph! Error: ${error.message}`);
    }
  };

  return (
    <div>
      {/* TODO - create component out of this navbar, its used in graph editor aswell */}
      <div className={styles.nav}>
        <Link href="/">
          <span>Back</span>
          <tds-icon
            slot="icon"
            style={{ marginLeft: "8px" }}
            size="14px"
            name="back"
          ></tds-icon>
        </Link>
      </div>
      <div className={styles.main}>
        <div className={styles.contentContainer}>
          <div
            slot="header"
            className={styles.contentContainer__headerContainer}
          >
            <span className="tds-detail-01">Execute graph</span>
            <h2 className="tds-headline-02">{iri}</h2>
          </div>
          {mode === "initial" && (
            <div className={styles.contentContainer__parameterContainer}>
              <tds-button
                class={styles.contentContainer__parameterContainer__btn}
                onClick={() => setMode("newParameter")}
                type="button"
                size="sm"
                variant="primary"
                fullbleed
                text="Create new parameter"
              ></tds-button>
              <span>or</span>
              <tds-dropdown
                class={styles.contentContainer__parameterContainer__dropdown}
                name="dropdown"
                placeholder="Choose parameter"
                size="md"
                open-direction="auto"
              >
                {parameters.map((param, index) => {
                  return (
                    <tds-dropdown-option
                      value={param.name}
                      key={index}
                      onClick={() => selectParameter(param)}
                    >
                      {param.name}
                    </tds-dropdown-option>
                  );
                })}
              </tds-dropdown>
            </div>
          )}
          {mode === "newParameter" && (
            <div className={styles.contentContainer__newParameterContainer}>
              <tds-text-field
                placeholder="Placeholder"
                label="Parameter name"
                label-position="outside"
                value={creatingNewParameter.name}
                onInput={(e: { currentTarget: { value: string } }) =>
                  setCreatingNewParameter({
                    ...creatingNewParameter,
                    name: e.currentTarget.value,
                  })
                }
              />
              <tds-textarea
                rows="20"
                label="JSON"
                value={creatingNewParameter.value}
                label-position="outside"
                placeholder="Placeholder"
                onInput={(e: { currentTarget: { value: string } }) =>
                  setCreatingNewParameter({
                    ...creatingNewParameter,
                    value: e.currentTarget.value,
                  })
                }
              ></tds-textarea>
            </div>
          )}
          {mode === "existingParameter" && (
            <div className={styles.contentContainer__newParameterContainer}>
              <tds-dropdown
                class={styles.contentContainer__parameterContainer__dropdown}
                name="dropdown"
                placeholder="Choose parameter"
                size="md"
                open-direction="auto"
                default-value={selectedParameter.name}
              >
                {parameters.map((param, index) => {
                  return (
                    <tds-dropdown-option
                      value={param.name}
                      key={index}
                      onClick={() => selectParameter(param)}
                    >
                      {param.name}
                    </tds-dropdown-option>
                  );
                })}
              </tds-dropdown>
              <tds-textarea
                rows="20"
                disabled={!enableEditParameter}
                label="JSON"
                label-position="outside"
                placeholder="Placeholder"
                value={selectedParameter.value}
              ></tds-textarea>
            </div>
          )}

          <div className={styles.action}>
            {mode === "newParameter" && (
              <>
                <tds-button
                  type="button"
                  size="sm"
                  variant="secondary"
                  text="Back"
                  onClick={() => changeMode("initial")}
                ></tds-button>
                <tds-button
                  type="button"
                  size="sm"
                  variant="primary"
                  text="Save parameter"
                  onClick={() => saveParameter()}
                ></tds-button>
                {/*

                TODO - executing a graph with a newly created parameter might be a bit tricky, holding on this one for now

                <tds-button
                  type="button"
                  size="sm"
                  variant="primary"
                  text="Execute"
                  onClick={() => executeGraph()}
                ></tds-button>
                */}
              </>
            )}

            {mode === "existingParameter" && (
              <>
                <tds-button
                  type="button"
                  size="sm"
                  variant="secondary"
                  text="Back"
                  onClick={() => changeMode("initial")}
                ></tds-button>
                <tds-button
                  type="button"
                  size="sm"
                  variant="secondary"
                  text={enableEditParameter ? "Cancel" : "Edit parameter"}
                  onClick={() => setEnableEditParameter(!enableEditParameter)}
                ></tds-button>
                <tds-button
                  type="button"
                  size="sm"
                  variant="danger"
                  text="Delete"
                  onClick={() => deleteParameter()}
                ></tds-button>
                {enableEditParameter && (
                  <tds-button
                    type="button"
                    size="sm"
                    variant="primary"
                    text="Save changes"
                    onClick={() => saveEditedParameter()}
                  ></tds-button>
                )}
                {!enableEditParameter && (
                  <tds-button
                    type="button"
                    size="sm"
                    variant="primary"
                    text="Execute"
                    onClick={() => executeGraph()}
                  ></tds-button>
                )}
              </>
            )}
          </div>
          <tds-modal selector="execution-result-modal" size="sm">
            <h5 className="tds-modal-headline" slot="header">
              Result
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
            <div slot="actions" className={styles.action}>
              <tds-button
                type="button"
                size="sm"
                variant="primary"
                text="Ok"
                onClick={() => {
                  (
                    document.querySelector(
                      `[selector="execution-result-modal"]`
                    ) as HTMLTdsModalElement
                  ).closeModal();
                }}
              ></tds-button>
              <tds-button
                type="button"
                size="sm"
                variant="secondary"
                text="Save execution result"
                onClick={() => saveExecutionResult()}
              ></tds-button>
            </div>
          </tds-modal>
        </div>
      </div>
    </div>
  );
}

export default ExecuteFlow;
