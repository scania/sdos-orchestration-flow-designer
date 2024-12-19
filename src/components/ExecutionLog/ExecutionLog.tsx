import React, { useState } from "react";

const ExecutionLog = ({ executionLog }: any) => {

  return (
    <>
    {executionLog.map((logItem) => (
        <>
        <div style={{background: 'rgba(43,112,211, .1)', border: '2px solid rgba(43,112,211, .25)', margin: '20px', display: 'flex', gap: '20px', padding: '10px'}}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <tds-icon
              style={{color: 'rgba(43,112,211, 1)'}}
              name="info"
              size="22px"
            ></tds-icon>
            </div>
            </div>
            <div>
            <div>
              {logItem.message}
            </div>
          </div>
        </div>
        <div style={{background: 'rgba(255, 35, 64, .1)', border: '2px solid rgba(255, 35, 64, .25)', margin: '20px', display: 'flex', gap: '20px', padding: '10px'}}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <tds-icon
              style={{color: 'rgba(255, 35, 64, 1)'}}
              name="error"
              size="22px"
            ></tds-icon>
            </div>
            </div>
            <div>
            <div>
              {logItem.message}
            </div>
          </div>
        </div>
        </>
        
      ))}
      </>
  );
};

export default ExecutionLog;
