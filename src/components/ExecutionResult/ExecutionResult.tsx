import React, { useState } from "react";
import JsonView from "@uiw/react-json-view";
import { isValidJson } from "@/helpers/helper";

const ExecutionResult = ({ executionResult }: any) => {

  return (
    
     <span>
            {executionResult ? (
              typeof executionResult === "object" ? (
                <JsonView
                  value={executionResult}
                  indentWidth={4}
                  displayDataTypes={false}
                  collapsed={false}
                  displayObjectSize={true}
                  enableClipboard={true}
                  quotes={`"`}
                />
              ) : isValidJson(executionResult) ? (
                <JsonView
                  value={JSON.parse(executionResult)}
                  indentWidth={4}
                  displayDataTypes={false}
                  collapsed={false}
                  displayObjectSize={true}
                  enableClipboard={true}
                  quotes={`"`}
                />
              ) : (
                <p>{executionResult}</p>
              )
            ) : null}
          </span> 
          
  );
};

export default ExecutionResult;
