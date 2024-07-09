import styles from "./graphOptions.module.scss";
import React from "react";

import { TdsTextarea, TdsTextField, TdsModal } from "@scania/tegel-react";

const GraphOptions = ({
  selector,
  graphDescription,
  graphName,
  accessType,
}) => {
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
          // helper="Character left"
          // max-length="140"
          label-position="outside"
          disabled
          value={graphDescription}
        ></TdsTextarea>
        <TdsTextField
          label="Access Type"
          label-position="outside"
          disabled
          value={accessType}
        ></TdsTextField>
        {/*
        <div className={styles.body__divider}>
          <tds-divider orientation="horizontal"></tds-divider>
        </div>
        
        <tds-dropdown
          name="dropdown"
          label="Access level"
          label-position="outside"
          placeholder="Placeholder"
          size="md"
          open-direction="auto"
        >
          <tds-dropdown-option value="private">Private</tds-dropdown-option>
          <tds-dropdown-option disabled value="semi-public">
            Semi-Public
          </tds-dropdown-option>
          <tds-dropdown-option value="public">Public</tds-dropdown-option>
        </tds-dropdown>

        <div className={styles.body__securityUrlContainer}>
          <a
            href="https://it.reflex.scania.com/00005/7600.html"
            target="_blank"
          >
            Named graph security
          </a>
        </div>
        <TdsTextField
          placeholder="Creator"
          label="Creator"
          label-position="outside"
          size="md"
          value="Placeholder"
        ></TdsTextField>
        <TdsTextField
          placeholder="Contributor"
          label="Contributor"
          label-position="outside"
          size="md"
          value="Placeholder"
        ></TdsTextField>
        <div className={styles.body__contributorsContainer}>
          <tds-button
            type="button"
            size="sm"
            variant="ghost"
            text="add contributors"
          >
            <tds-icon slot="icon" name="plus"></tds-icon>
          </tds-button>
        </div>
                */}
      </div>
      <span slot="actions">
        {/*<div className={styles.action}>
          <tds-button
            type="button"
            size="sm"
            variant="primary"
            text="Confirm"
          ></tds-button>
          <tds-button
            type="button"
            size="sm"
            variant="secondary"
            text="Cancel"
          ></tds-button>
              </div> */}
      </span>
    </TdsModal>
  );
};

export default GraphOptions;
