import userPreferencesStore from "../../store/userPreferencesStore";
import Toggle from "../Toggle/Toggle";
import styles from "./UserPreferences.module.scss";
import { TdsDropdown, TdsDropdownOption } from "@scania/tegel-react";

const UserPreferences = () => {
  const {
    doubleClickToEnterSetupMode,
    toggleDoubleClickToEnterSetupMode,
    connectionType,
    setConnectionType,
  } = userPreferencesStore();

  return (
      <div className={styles.optionsContainer}>
        <div className={styles.optionContainer} onClick={toggleDoubleClickToEnterSetupMode}>
          <div>
            Double-click node:
          </div>
          <div>
            <Toggle isOn={doubleClickToEnterSetupMode} onToggle={() => toggleDoubleClickToEnterSetupMode} />
          </div>
        </div>
        <div className={styles.optionContainer}>
          <div>
            Connection type:
          </div>
          <TdsDropdown
            name="dropdown"
            placeholder="Select parameter set"
            size="sm"
            multiselect={false}
            onTdsChange={(e) => setConnectionType(e.detail.value)}
            open-direction="auto"
            normalizeText={true}
            defaultValue={connectionType}
          >
            <TdsDropdownOption value={"steps"} key={"steps"}>
              Steps
            </TdsDropdownOption>
            <TdsDropdownOption value={"straight"} key={"straight"}>
              Straight
            </TdsDropdownOption>
            <TdsDropdownOption value={"bezier"} key={"bezier"}>
              Bezier
            </TdsDropdownOption>
          </TdsDropdown>
        </div>
      </div>
  );
};

export default UserPreferences;
