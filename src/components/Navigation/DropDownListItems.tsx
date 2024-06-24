import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Session } from "next-auth";
import {
  TdsHeaderDropdownListUser,
  TdsHeaderDropdownListItem,
  TdsIcon,
} from "@scania/tegel-react";

interface DropDownListItemsProps {
  session: Session | null;
}

const DropDownListItems: React.FC<DropDownListItemsProps> = ({ session }) => {
  const router = useRouter();

  const handleLogout = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    signOut({ callbackUrl: "/auth/logout" });
  };

  if (!session) return null;

  return (
    <>
      <TdsHeaderDropdownListUser
        header={session.user?.name || ""}
        subheader="Admin"
      />
      <TdsHeaderDropdownListItem onClick={() => router.push("/settings")}>
        <Link href="/settings">
          <TdsIcon name="settings" />
          <div className="tds-u-pl1">Settings</div>
        </Link>
      </TdsHeaderDropdownListItem>
      <TdsHeaderDropdownListItem>
        <Link href="/help">
          <TdsIcon name="info" />
          <div className="tds-u-pl1">Need Help?</div>
        </Link>
      </TdsHeaderDropdownListItem>
      <TdsHeaderDropdownListItem onClick={handleLogout}>
        <Link href="#" passHref>
          <div style={{ display: "inline-block" }}>
            <TdsIcon
              name="profile_inactive"
              style={{ display: "inline-block" }}
            />
            <div className="tds-u-pl1" style={{ display: "inline-block" }}>
              Logout
            </div>
          </div>
        </Link>
      </TdsHeaderDropdownListItem>
    </>
  );
};

export default DropDownListItems;
