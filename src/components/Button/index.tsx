import classNames from "classnames";
import styles from "../../extractedStyles/tds-button.module.css";

type ButtonProps = {
  id?: string,
  type: "button" | "submit" | "reset";
  size?: "small" | "medium" | "large";
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  fullbleed?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  children?: React.ReactNode; // <-- Add this line
};

const Button: React.FC<ButtonProps> = ({
  id,
  type,
  size = "medium",
  variant = "primary",
  disabled = false,
  fullbleed = false,
  onClick,
  children, // <-- Add this
}) => {
  const classes = classNames({
    [type]: true,
    [size]: true,
    [variant]: true,
  });

  return (
    <div
      className={classNames(
        styles["sc-tds-button-h"],
        styles["sc-tds-button-s"]
      )}
    >
      <button
        id={id}
        type="reset"
        className={classNames(
          styles[variant],
          styles.lg,
          styles["sc-tds-button"]
        )}
        onClick={onClick}
      >
        {children}
      </button>
    </div>
  );
};

export default Button;
