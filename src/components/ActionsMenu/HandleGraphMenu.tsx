import { TdsIcon } from "@scania/tegel-react";
import styles from "./actionsMenu.module.scss";

const HandleGraphMenu = ({ onDeleteClick }) => {
  return (
    <div className={styles.container}>
      <ul className={styles.container__list}>
        <li onClick={onDeleteClick} className={styles.container__list__item}>
          <span className={styles.container__list__item__icon}>
            <TdsIcon slot="icon" size="14" name="trash"></TdsIcon>
          </span>
          <span>Delete</span>
        </li>
      </ul>
    </div>
  );
};

export default HandleGraphMenu;
