import styles from "./Sidebar.module.scss";

const ClassChip = ({ highlightedClassLabel, className, setHighlightedClassLabel, handleOnDrag }: any) => {

  return (
    <div
      draggable
      key={className}
      onClick={() => setHighlightedClassLabel(className)}
      onDragStart={(e) => handleOnDrag(e, className)}
      className={`${styles.classes__class} ${
        highlightedClassLabel === className
          ? styles.active__chip
          : styles.inactive__chip
      }`}
    >
      <div className={styles.classes__class__content}>
        <div
          className={`${styles.classes__class__content__icon} ${
            highlightedClassLabel === className ? styles.active__container : ""
          }`}
        >
          <tds-icon name="double_kebab" size="16px"></tds-icon>
        </div>
        <span className={styles.classes__class__content__label}>
          {className}
        </span>
      </div>
    </div>
  );
};

export default ClassChip;
