import React from 'react';
import Modal from 'react-modal';
import styles from "./customModal.module.scss";


// Bind modal to app element for accessibility
Modal.setAppElement('#__next');

interface CustomModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const CustomModal: React.FC<CustomModalProps> = ({ isOpen, onRequestClose, title, children }) => {
  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      maxHeight: '80vh',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      padding: '20px',
      borderRadius: '4px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      minWidth: window.innerWidth > 480 && '480px',
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      // Z-index to override tegel-items with high z-index
      zIndex: '101'
    },
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel={title || 'Modal'}
    >
      <div>
        <div className={styles.header}>
          <h5>
            {title}
          </h5>
          <div className="pointer" >
            <tds-icon onClick={onRequestClose} name="cross" />
          </div>
        </div>
        <div>{children}</div>
      </div>
    </Modal>
  );
};

export default CustomModal
