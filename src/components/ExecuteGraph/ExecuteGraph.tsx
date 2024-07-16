import React, { useEffect, useState } from "react";
import styles from "./executeGraph.module.scss";
import axios from "axios";
import TextBox from "../TextBox/TextBox";

const ExecuteGraph = ({ selector, parameters, graphName }) => {
  const [mode, setMode] = useState("execute");
  const [result, setResult] = useState("");
  const [selectedParameter, setSelectedParameter] = useState("");

  const closeModal = () => {
    (document.querySelector(`[selector="${selector}"]`) as HTMLTdsModalElement
    ).closeModal();
    setMode("execute")
  };

  const executeGraph = () => {
    axios
      .get(`PLACEHOLDER_URL`)
      .then((res) => {
        alert("Successfully executed graph");
        setResult("The result after a successful call goes here");
        setMode("result");
      })
      .catch((res) => {
        alert("Failed to execute graph");
        setResult("Failed to execute graph!");
        // TODO - might not want to change mode after a failed result
        setMode("result");
      });
  };

  return (
    <tds-modal
      selector={selector}
      size="sm"
      prevent
    >
      <h5 className="tds-headline-05" slot="header">
        {mode === "execute" ? (
          <span>Execute graph - {graphName}</span>
        ) : (
          <span>Execution result - {graphName}</span>
        )}
      </h5>

      <div slot="body" className={styles.body}>
        {mode === "execute" ? (
          <div className={styles.body__parameterContainer}>
            <tds-dropdown
              class={styles.body__parameterContainer__dropdown}
              name="dropdown"
              label="Parameter name"
              label-position="outside"
              placeholder="Choose parameter"
              size="md"
              open-direction="auto"
            >
              {parameters.map((param, index) => {
                return (
                  <tds-dropdown-option value={param.name} key={index} onClick={() => setSelectedParameter(param.name)}>
                    {param.name}
                  </tds-dropdown-option>
                );
              })}
            </tds-dropdown>
            <tds-button
              type="button"
              size="sm"
              variant="primary"
              disabled
              text="Create new"
            ></tds-button>
          </div>
        ) : (
          <div>
            <div>
              <h6>Used parameter:</h6>
              <div>{selectedParameter}</div>
            </div>
            <div>
              <TextBox label="Result:" text={result}/>
            </div>
          </div>
        )}
      </div>
      <span slot="actions">
        <div className={styles.action}>
        <tds-button
          type="button"
          size="sm"
          variant="secondary"
          text="Cancel"
          onClick={() => closeModal()}
        ></tds-button>
        {mode === "execute" ? (
          <tds-button
            type="button"
            size="sm"
            variant="primary"
            text="Execute graph"
            onClick={() => executeGraph()}
          ></tds-button>
        ) : null}
      </div>
      </span>
    </tds-modal>
  );
};

export default ExecuteGraph;
