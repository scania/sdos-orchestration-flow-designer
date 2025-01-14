import React from 'react';
import Modal from 'react-modal';
import styles from "./customModal.module.scss";

Modal.setAppElement('#__next');

interface CustomModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const CustomModal: React.FC<CustomModalProps> = ({ isOpen, onRequestClose, title, children }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className={styles.modalContent}
      overlayClassName={styles.modalOverlay}
      contentLabel={title || 'Modal'}
    >
      <div>
        <div className={styles.header}>
          <h5>{title}</h5>
          <div className="pointer">
            <tds-icon onClick={onRequestClose} name="cross" />
          </div>
        </div>
        <div>{children}</div>
      </div>
    </Modal>
  );
};

export default CustomModal;
