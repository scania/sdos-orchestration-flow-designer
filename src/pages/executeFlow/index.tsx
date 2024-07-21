import React, { useState } from "react";
import { getSession } from "next-auth/react";
import Link from "next/link";
import TextBox from "@/components/TextBox/TextBox";
import axios from "axios";
import styles from "./ExecuteFlow.module.scss";

export async function getServerSideProps(context: any) {
  const session = await getSession(context);
  if (!session?.user) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }
  return {
    props: {},
  };
}

function ExecuteFlow() {
  const [mode, setMode] = useState("execute");
  const [result, setResult] = useState("");
  const [selectedParameter, setSelectedParameter] = useState({
    name: "",
    value: "",
  });
  const [parameters, setParameters] = useState([
    { name: "One parameter", value: "JSON of the parameter goes here" },
    { name: "Test", value: "JSON of the parameter goes here" },
    { name: "Third example", value: "JSON of the parameter goes here" },
  ]);

  const saveParameter = () => {
    alert("Parameter saved")
  }

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
    <div className={`App`}>
      <div className={styles.main}>
        <div style={{marginBottom: '20px'}}>
        <Link href="/">
          <span>Back</span>
          <tds-icon slot="icon" style={{marginLeft: '8px'}} size="14px" name="back"></tds-icon>
        </Link>
        </div>
        <h3 className="tds-headline-03" slot="header">
          {mode === "execute" ? (
            <span>Execute graph - graphname</span>
          ) : (
            <span>Execution result - graphname</span>
          )}
        </h3>

        <div>
          {mode === "execute" ? (
              <div className={styles.body__parameterContainer}>
                <div>
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
                        <tds-dropdown-option
                          value={param.name}
                          key={index}
                          onClick={() =>
                            setSelectedParameter({
                              name: param.name,
                              value: param.value,
                            })
                          }
                        >
                          {param.name}
                        </tds-dropdown-option>
                      );
                    })}
                  </tds-dropdown>
                    <tds-button
                      type="button"
                      size="sm"
                      variant="secondary"
                      fullbleed
                      text="Create new"
                    ></tds-button>
                </div>
                {selectedParameter.value && (
                  <div className={styles.body__parameterContainer__parameterInformation}>
                    <tds-textarea
                      label="JSON"
                      rows={5}
                      label-position="outside"
                      value={selectedParameter.value}
                    ></tds-textarea>
                    <tds-button
                      type="button"
                      size="sm"
                      fullbleed
                      variant="secondary"
                      text="Save"
                      onClick={() => saveParameter()}
                    ></tds-button>
                  </div>
                )}
              </div>
          ) : (
            <div>
              <div>
                <h6>Used parameter:</h6>
                <div>{selectedParameter.name}</div>
              </div>
              <div>
                <TextBox label="Result:" text={result} />
              </div>
            </div>
          )}
        </div>
        <div className={styles.action}>
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
      </div>
    </div>
  );
}

export default ExecuteFlow;
