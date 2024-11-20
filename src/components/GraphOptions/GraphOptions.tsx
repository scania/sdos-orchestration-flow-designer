import styles from "./graphOptions.module.scss";
import React from "react";

const GraphOptions = ({ selector, graphDescription, graphName, user }) => {
  return (
    <tds-modal selector={selector} size="xs">
      <h5 className="tds-headline-05" slot="header">
        Options
      </h5>
      <div slot="body" className={styles.body}>
        <tds-text-field
          placeholder="Title"
          label="Title"
          label-position="outside"
          size="md"
          disabled
          value={graphName}
        ></tds-text-field>
        <tds-textarea
          label="Description"
          label-position="outside"
          disabled
          value={graphDescription}
        ></tds-textarea>
      </div>
      <span slot="actions"></span>
    </tds-modal>
  );
};

export default GraphOptions;
