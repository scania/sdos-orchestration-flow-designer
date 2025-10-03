import { TdsModal, TdsTextarea, TdsTextField } from "@scania/tegel-react";
import styles from "./graphOptions.module.scss";

const GraphOptions = ({ selector, graphDescription, graphName, author }) => {
  return (
    <TdsModal selector={selector} size="xs">
      <h5 className="tds-headline-05" slot="header">
        Options
      </h5>
      <div slot="body" className={styles.body}>
        <TdsTextField
          placeholder="Title"
          label="Title"
          label-position="outside"
          size="md"
          disabled
          value={graphName}
        ></TdsTextField>
        <TdsTextarea
          label="Description"
          label-position="outside"
          disabled
          value={graphDescription}
        ></TdsTextarea>
        <TdsTextField
          placeholder="Author"
          label="Author"
          label-position="outside"
          size="md"
          disabled
          value={author?.email}
        ></TdsTextField>
      </div>
      <span slot="actions"></span>
    </TdsModal>
  );
};

export default GraphOptions;
