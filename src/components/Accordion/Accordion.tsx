/* 
  TODO - This accordion component is currently based on the secondary panel accordion.
  It could either be focused on that, or refactored to be a bit more generic for the future.
*/
import { TdsButton, TdsIcon } from "@scania/tegel-react";
import styles from "./accordion.module.scss";
import { useState } from "react";

type AccordionProps = {
  label?: string;
  children?: React.ReactNode;
  onButtonClick?: Function;
  button?: boolean;
  buttonText?: string;
  numberOfElements?: number;
};

const Accordion: React.FC<AccordionProps> = ({
  label,
  children,
  button,
  buttonText,
  onButtonClick,
  numberOfElements,
}) => {
  const handleClick = (e) => {
    // Stop propogation to avoid toggling the accordion on button click
    e.stopPropagation();
    onButtonClick();
  };

  const [opened, setOpened] = useState(true);

  return (
    <div className="container">
      <div className={styles.header} onClick={() => setOpened(!opened)}>
        <span>
          <span
            className={`${styles.header__icon} ${
              opened ? styles.header__icon__opened : styles.header__icon__closed
            }`}
          >
            <TdsIcon
              name={opened ? "chevron_up" : "chevron_down"}
              size="16px"
            ></TdsIcon>
          </span>
          <span className={styles.header__label}>
            {label} ({numberOfElements})
          </span>
        </span>
        {button && (
          <TdsButton
            type="button"
            size="sm"
            variant="ghost"
            text={buttonText}
            onClick={handleClick}
          >
            <TdsIcon slot="icon" name="plus"></TdsIcon>
          </TdsButton>
        )}
      </div>
      {opened && <div className={styles.children}>{children}</div>}
    </div>
  );
};

export default Accordion;
