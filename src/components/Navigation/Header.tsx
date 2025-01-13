import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  TdsHeader,
  TdsHeaderTitle,
  TdsHeaderDropdown,
  TdsHeaderDropdownList,
  TdsHeaderDropdownListItem,
  TdsHeaderDropdownListUser,
  TdsHeaderBrandSymbol,
  TdsIcon,
  TdsHeaderItem,
} from "@scania/tegel-react";

const Header = () => {
  const { data: session } = useSession();

  const handleLogout = (e: any) => {
    e.preventDefault();
    signOut({ callbackUrl: "/auth/logout" });
  };

  return (
    <TdsHeader>
      <Link href="/">
        <TdsHeaderTitle>
          {`ORCHESTRATION FLOW GRAPH DESIGNER BETA ${
            process.env.NEXT_PUBLIC_VERSION || ""
          }`}
        </TdsHeaderTitle>
      </Link>

      {session?.user && (
        <>
          <TdsHeaderItem slot="end" no-dropdown-icon>
            <Link href="/settings">
              <TdsIcon name="settings"></TdsIcon>
            </Link>
          </TdsHeaderItem>
          <TdsHeaderDropdown slot="end" no-dropdown-icon>
            <div slot="icon">
              <img
                src="https://www.svgrepo.com/show/384676/account-avatar-profile-user-6.svg"
                alt="User menu."
              />
            </div>
            <TdsHeaderDropdownList size="lg">
              <TdsHeaderDropdownListUser
                header={session?.user?.name}
                subheader={session?.user?.email}
              ></TdsHeaderDropdownListUser>
              <TdsHeaderDropdownListItem onClick={handleLogout}>
                <Link href="">
                  <TdsIcon name="profile_inactive"></TdsIcon>
                  <div className="tds-u-pl1">Logout</div>
                </Link>
              </TdsHeaderDropdownListItem>
            </TdsHeaderDropdownList>
          </TdsHeaderDropdown>
        </>
      )}
      <TdsHeaderBrandSymbol slot="end">
        <a aria-label="Scania - red gryphon on blue shield" href="/"></a>
      </TdsHeaderBrandSymbol>
    </TdsHeader>
  );
};

export default Header;
