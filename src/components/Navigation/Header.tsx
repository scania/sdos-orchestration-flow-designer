import Link from "next/link";
import { useTheme } from "@/context/ThemeProvider";
import useWebComponent from "@/hooks/useWebComponent";

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const toggleRef = useWebComponent("tdsToggle", () => {
    toggleTheme();
  });

  return (
    <tds-header>
      <tds-header-title>ORCHESTRATION FLOW DESIGNER</tds-header-title>

      <tds-header-dropdown onClick={() => {}} slot="end" no-dropdown-icon>
        <div slot="icon">
          <tds-icon name="search"></tds-icon>
        </div>
      </tds-header-dropdown>

      <tds-header-dropdown onClick={() => {}} slot="end" no-dropdown-icon>
        <div slot="icon">
          <Link href="settings">
            <tds-icon name="settings"></tds-icon>
          </Link>
        </div>
      </tds-header-dropdown>

      <tds-header-dropdown onClick={() => {}} slot="end" no-dropdown-icon>
        <div slot="icon">
          <tds-icon name="bento"></tds-icon>
        </div>
      </tds-header-dropdown>

      <tds-header-dropdown onClick={() => {}} slot="end" no-dropdown-icon>
        <div slot="icon">
          <img
            src="https://www.svgrepo.com/show/384676/account-avatar-profile-user-6.svg"
            style={{ width: 50, height: 50 }}
            className="center-image"
            alt="User menu."
          />
          {1 > 0 && <tds-badge size="sm"></tds-badge>}
        </div>
        <tds-header-dropdown-list size="lg">
          <tds-header-dropdown-list-user
            header="SaiReddy Medapati"
            subheader="Admin"
          ></tds-header-dropdown-list-user>
          <tds-header-dropdown-list-item>
            <div className="tds-u-ml2 tds-u-mt2">
              <tds-toggle ref={toggleRef as any}>
                <div slot="label">{theme} mode</div>
              </tds-toggle>
            </div>
          </tds-header-dropdown-list-item>
          <tds-header-dropdown-list-item>
            <Link href="settings">
              <tds-icon name="settings"></tds-icon>
              <div className="tds-u-pl1">Settings</div>
            </Link>
          </tds-header-dropdown-list-item>

          <tds-header-dropdown-list-item>
            <Link href="help">
              <tds-icon name="info"></tds-icon>
              <div className="tds-u-pl1">Need Help?</div>
            </Link>
          </tds-header-dropdown-list-item>
        </tds-header-dropdown-list>
      </tds-header-dropdown>

      <tds-header-brand-symbol slot="end">
        <Link aria-label="Scania - red gryphon on blue shield" href="/"></Link>
      </tds-header-brand-symbol>
    </tds-header>
  );
};

export default Header;
