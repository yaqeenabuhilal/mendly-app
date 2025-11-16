// react-app/src/pages/EmotionalBalancePage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import flowersTop from "../assets/emotional-balance-top.png";

const EmotionalBalancePage: React.FC = () => {
  const navigate = useNavigate();

  const CREAM = "#f5e9d9";
  const BLUE = "#6BA7E6";

  const screenStyle: React.CSSProperties = {
    height: "100vh",
    width: "100vw",
    margin: 0,
    padding: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "stretch",
    backgroundColor: CREAM,
    fontFamily:
      '"Poppins", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  };

  // MAIN PHONE CONTAINER – scrolls if content is too tall
  const phoneStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    maxWidth: "450px",
    margin: "0 auto",
    backgroundColor: CREAM,
    borderRadius: 32,
    overflowY: "auto", // <-- important: no cutting on short windows
    overflowX: "hidden",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
  };

  const topImageWrapper: React.CSSProperties = {
    width: "100%",
    height: "25%", // close to the design, but a bit smaller for short screens
    minHeight: 180,
    flexShrink: 0,
  };

  const topImageStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  const contentStyle: React.CSSProperties = {
    padding: "20px 24px 28px 24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    color: BLUE,
  };

  const smallTitleStyle: React.CSSProperties = {
    fontFamily: '"Times New Roman", Georgia, serif',
    fontSize: 26,
    lineHeight: 1.1,
  };

  const bigTitleStyle: React.CSSProperties = {
    fontFamily: '"Times New Roman", Georgia, serif',
    fontSize: 30,
    lineHeight: 1.1,
    marginBottom: 16,
  };

  const paragraphStyle: React.CSSProperties = {
    fontFamily: '"Times New Roman", Georgia, serif',
    fontSize: 17,
    lineHeight: 1.35,
    marginBottom: 22,
  };

  const subtitleStyle: React.CSSProperties = {
    fontFamily: '"Times New Roman", Georgia, serif',
    fontSize: 17,
    marginBottom: 10,
  };

  const primaryButton: React.CSSProperties = {
    minWidth: 220,
    padding: "10px 30px",
    borderRadius: 999,
    border: "none",
    backgroundColor: BLUE,
    color: CREAM,
    fontSize: 18,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 10px 22px rgba(0,0,0,0.18)",
    marginBottom: 22,
  };

  const secondaryText: React.CSSProperties = {
    fontFamily: '"Times New Roman", Georgia, serif',
    fontSize: 17,
    marginBottom: 8,
  };

  const secondaryButton: React.CSSProperties = {
    ...primaryButton,
    marginBottom: 0,
  };

  return (
    <div style={screenStyle}>
      <div style={phoneStyle}>
        {/* Top image */}
        <div style={topImageWrapper}>
          <img src={flowersTop} alt="Flowers" style={topImageStyle} />
        </div>

        {/* Text + buttons */}
        <div style={contentStyle}>
          <div style={smallTitleStyle}>Find Your</div>
          <div style={bigTitleStyle}>Emotional Balance</div>

          <div style={paragraphStyle}>
            Mendly supports you in,
            <br />
            understanding your feelings,
            <br />
            building emotional strength,
            <br />
            and improving your mental
            <br />
            wellbeing with gentle guidance
          </div>

          <div style={subtitleStyle}>Your journey begins here</div>

          <button
            type="button"
            style={primaryButton}
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>

          <div style={secondaryText}>Already have an account?</div>

          <button
            type="button"
            style={secondaryButton}
            onClick={() => navigate("/login")}
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmotionalBalancePage;
