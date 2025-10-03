import { TdsIcon } from "@scania/tegel-react";
import styles from "./Sidebar.module.scss";

interface ClassChipProps {
  highlightedClass: { label: string; type: string };
  className: string;
  connectorType: string;
  setHighlightedClass: (highlightedClass: {
    label: string;
    type: string;
  }) => void;
  handleOnDrag: (
    event: React.DragEvent<HTMLDivElement>,
    className: string
  ) => void;
}

const ClassChip: React.FC<ClassChipProps> = ({
  highlightedClass,
  className,
  connectorType,
  setHighlightedClass,
  handleOnDrag,
}) => {
  return (
    <div
      draggable
      key={className}
      onClick={() =>
        setHighlightedClass({ label: className, type: connectorType })
      }
      onDragStart={(e) => handleOnDrag(e, className)}
      className={`${styles.classes__class} ${
        highlightedClass.label === className &&
        highlightedClass.type === connectorType
          ? styles.active__chip
          : styles.inactive__chip
      }`}
    >
      <div className={styles.classes__class__content}>
        <div
          className={`${styles.classes__class__content__icon} ${
            highlightedClass.label === className &&
            highlightedClass.type === connectorType
              ? styles.active__container
              : ""
          }`}
        >
          <TdsIcon name="double_kebab" size="16px"></TdsIcon>
        </div>
        <span className={styles.classes__class__content__label}>
          {className}
        </span>
      </div>
    </div>
  );
};

export default ClassChip;
