import React from "react";

const footerStyle = {
  textAlign: "center",
  fontSize: 11,
  color: "#94a3b8",
  background: "#f8fafc",
  padding: "6px 0",
  borderTop: "1px solid #e2e8f0",
};

export default function Footer() {
  return (
    <div className="footer" style={footerStyle}>
      &copy; 2026 Madden Frameworks
    </div>
  );
}
