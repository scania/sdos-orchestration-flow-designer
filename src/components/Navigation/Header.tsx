import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

const DropDownListItems = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const handleLogout = (e: any) => {
    e.preventDefault();
    signOut({ callbackUrl: "/auth/logout" });
  };

  return (
    <>
      {session ? (
        <>
          <tds-header-dropdown-list-user
            header={session?.user?.name || ""}
            subheader="Admin"
          ></tds-header-dropdown-list-user>
          <tds-header-dropdown-list-item onClick={handleLogout}>
            <Link href="#" passHref>
              <div style={{ display: "inline-block" }}>
                <tds-icon
                  name="profile_inactive"
                  style={{ display: "inline-block" }}
                ></tds-icon>
                <div className="tds-u-pl1" style={{ display: "inline-block" }}>
                  Logout
                </div>
              </div>
            </Link>
          </tds-header-dropdown-list-item>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

const DropDownListDynamic = dynamic(() => Promise.resolve(DropDownListItems), {
  ssr: false,
});

const Header = () => {
  return (
    <tds-header>
      <tds-header-title>
        {`ORCHESTRATION FLOW GRAPH DESIGNER BETA ${
          process.env.NEXT_PUBLIC_VERSION || ""
        }`}
      </tds-header-title>
      <tds-header-dropdown onClick={() => {}} slot="end" no-dropdown-icon>
        <div slot="icon">
          <Link href="/settings">
            <tds-icon name="settings"></tds-icon>
          </Link>
        </div>
      </tds-header-dropdown>
      <tds-header-dropdown onClick={() => {}} slot="end" no-dropdown-icon>
        <div slot="icon">
          <img
            src="https://www.svgrepo.com/show/384676/account-avatar-profile-user-6.svg"
            style={{ maxWidth: "unset" }}
            alt="User menu."
          />
        </div>
        <tds-header-dropdown-list size="lg">
          <DropDownListDynamic />
        </tds-header-dropdown-list>
      </tds-header-dropdown>
      <tds-header-brand-symbol slot="end">
        <Link aria-label="Scania - red gryphon on blue shield" href="/"></Link>
      </tds-header-brand-symbol>
    </tds-header>
  );
};

export default Header;
