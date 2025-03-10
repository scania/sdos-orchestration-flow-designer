import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from 'next/navigation'
import { onOutsideClick } from "@/hooks/onOutsideClick";
import CogWheel from "../../icons/CogWheel";
import styles from "./Header.module.scss";

const Header = () => {
  const { data: session } = useSession();
  const pathname = usePathname()
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);

  const avatarDropdownRef = onOutsideClick(() => {
    setIsAvatarDropdownOpen(false);
  });

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the outside click handler
    setIsAvatarDropdownOpen(!isAvatarDropdownOpen);
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    signOut({ callbackUrl: "/auth/logout" });
  };

  return (
    <div className={styles.header}>
      <Link href="/" className={styles.header__title}>
        {`ORCHESTRATION FLOW GRAPH DESIGNER BETA ${
          process.env.NEXT_PUBLIC_VERSION || ""
        }`}
      </Link>
      <div className={styles.header__content}>
        {session && (
          <>
            <Link href="/settings">
              <div className={`${styles.header__item} ${pathname === '/settings' ? `${styles.header__item__active}` : ''} `}>
                <div className={styles.header__item__iconSm}>
                  <CogWheel />
                </div>
              </div>
            </Link>
            <div ref={avatarDropdownRef}>
              <div className={`${styles.header__item}  ${isAvatarDropdownOpen ? `${styles.header__item__dropdown__active}` : ''} `} onClick={toggleMenu}>
                <img
                  src="https://www.svgrepo.com/show/384676/account-avatar-profile-user-6.svg"
                  alt="User Avatar"
                  className={styles.header__item__icon}
                />
              </div>
              {isAvatarDropdownOpen && (
                <div className={styles.header__avatarDropdown}>
                  <div className={styles.user}>
                    <span className={`${styles.user__name} tds-headline-07`}>
                      {session.user?.name}
                    </span>
                    <span className={`${styles.user__email} tds-headline-07`}>
                      {session.user?.email}
                    </span>
                  </div>
                  <div
                    className={styles.header__avatarDropdown__item}
                    onClick={handleLogout}
                  >
                    Logout
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        <div className={styles.header__item}>
          <img
            src="https://cdn.digitaldesign.scania.com/logotype/1.0.0/scania_symbol/scania-symbol.svg"
            className={styles.header__item__icon}
            alt="Scania Logo"
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
