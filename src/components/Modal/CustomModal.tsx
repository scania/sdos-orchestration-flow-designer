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

const getCustomStyles = () => {
  const isMobile = window.innerWidth < 768;

  return {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      maxHeight: '80vh',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      padding: isMobile ? '10px' : '20px',
      borderRadius: '4px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      minWidth: isMobile ? '280px' : '360px',
      maxWidth: isMobile ? '90%' : '1200px',
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: '101',
    },
  };
};

const CustomModal: React.FC<CustomModalProps> = ({ isOpen, onRequestClose, title, children }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={getCustomStyles()}
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
