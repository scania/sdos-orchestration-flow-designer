import { useTheme } from "@/context/ThemeProvider";
import React, { ReactNode } from "react";
import Footer from "../Footer";
import Header from "../Navigation/Header";
import styles from "./Layout.module.scss";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme } = useTheme();
  return (
    <div className={`tds-mode-${theme} ${styles.container}`}>
      <div className="announcement-banner">
        <Header />
      </div>
      <main className={styles.main}>{children}</main>
      <Footer/>
    </div>
  );
};

export default Layout;
