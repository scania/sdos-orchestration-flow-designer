import Link from "next/link";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import {
  TdsHeader,
  TdsIcon,
  TdsHeaderDropdownList,
  TdsHeaderTitle,
  TdsHeaderBrandSymbol,
  TdsHeaderDropdown,
  TdsHeaderItem,
} from "@scania/tegel-react";

const DropDownListDynamic = dynamic(() => import("./DropDownListItems"), {
  ssr: false,
});

const Header: React.FC = () => {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  return (
    <TdsHeader>
      <TdsHeaderTitle>ORCHESTRATION FLOW DESIGNER BETA 1.0</TdsHeaderTitle>
      {!isLoading && session && (
        <>
          <TdsHeaderItem slot="end">
            <Link href="/settings">
              <TdsIcon name="settings" size="22px" />
            </Link>
          </TdsHeaderItem>
          <TdsHeaderDropdown slot="end" no-dropdown-icon>
            <div slot="icon">
              <img
                src="https://www.svgrepo.com/show/384676/account-avatar-profile-user-6.svg"
                style={{ maxWidth: "unset" }}
                alt="User menu."
              />
            </div>
            <TdsHeaderDropdownList size="lg">
              <DropDownListDynamic session={session} />
            </TdsHeaderDropdownList>
          </TdsHeaderDropdown>
        </>
      )}
      <TdsHeaderBrandSymbol slot="end">
        <Link href="/" aria-label="Scania - red gryphon on blue shield">
          <></>
        </Link>
      </TdsHeaderBrandSymbol>
    </TdsHeader>
  );
};

export default Header;
