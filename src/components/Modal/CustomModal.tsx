import Modal from 'react-modal';
import styles from "./customModal.module.scss";

Modal.setAppElement('#__next');

interface CustomModalProps {
  isOpen: boolean;
  width: string;
  onRequestClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const getWidthValue = (width: string): string | undefined => {
  switch (width) {
    case 'sm':
      return '300px';
    case 'md':
      return '550px';
    case 'lg':
      return '800px';
    default:
      return undefined;
  }
};

const CustomModal: React.FC<CustomModalProps> = ({ isOpen, onRequestClose, title, children, width }) => {
  const resolvedWidth = getWidthValue(width);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className={styles.modalContent}
      overlayClassName={styles.modalOverlay}
      contentLabel={title || 'Modal'}
      style={{
        content: {
          minWidth: resolvedWidth
        },
      }}
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
