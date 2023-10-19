import React, { CSSProperties } from "react";

interface LinkProps {
  href: string;
  underline?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

const Link: React.FC<LinkProps> = ({ href, underline, disabled, children }) => {
  const baseStyle: CSSProperties = {
    textDecoration: underline ? "underline" : "none",
    cursor: disabled ? "not-allowed" : "pointer",
    color: disabled ? "grey" : "var(--tds-blue-400)",
    pointerEvents: disabled ? "none" : "auto",
  };

  return (
    <a href={disabled ? "#" : href} style={baseStyle}>
      {children}
    </a>
  );
};

export default Link;
