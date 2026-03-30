import React from "react";

const headerStyle = {
  background: "linear-gradient(135deg, #2d3748 0%, #4a5568 100%)",
  color: "white",
  height: 52,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 16px",
  paddingTop: "env(safe-area-inset-top)",
};

const titleStyle = {
  fontSize: 20,
  fontWeight: 700,
};

const badgeStyle = {
  background: "rgba(255,255,255,0.15)",
  border: "1px solid rgba(255,255,255,0.25)",
  borderRadius: 6,
  padding: "4px 10px",
  fontSize: 11,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: 1,
};

export default function Header() {
  return (
    <div className="header" style={headerStyle}>
      <span style={titleStyle}>StoreSprint</span>
      <span style={badgeStyle}>REGION 41</span>
    </div>
  );
}
