import styles from "./onNavigationModal.module.scss";
import React from "react";
import Modal from "../Modal/CustomModal";

interface OnNavigationModalProps {
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const OnNavigationModal: React.FC<OnNavigationModalProps> = ({ show, onConfirm, onCancel }) => {

  return (
    <Modal
      isOpen={show}
      onRequestClose={onCancel}
      title="Unsaved changes"
    >
        <div>
          <div>
           Are you sure you want to leave this page?
          </div>
          <div style={{ marginTop: "28px" }} />
          <div className={styles.footer}>
          <tds-button
              onClick={() => onCancel()}
              size="md"
              text="Cancel"
              variant="secondary"
            />
            <tds-button
              onClick={() => onConfirm()}
              size="md"
              text="Yes"
              variant="primary"
            />
          </div>
        </div>
      </Modal>
  );
};

export default OnNavigationModal;
