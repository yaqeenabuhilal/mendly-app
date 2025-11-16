// react-app/src/pages/WelcomePage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import cloudsBg from "../assets/welcome-clouds.jpg";

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  // colors aligned with the rest of the app
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
  };

  const phoneStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    maxWidth: "450px",
    margin: "0 auto",
    backgroundColor: CREAM,
    position: "relative",
    overflow: "hidden",
    boxSizing: "border-box",
    padding: "32px 28px 40px 28px",
    fontFamily:
      '"Poppins", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  };

  // top-left text block
  const textBlockStyle: React.CSSProperties = {
    position: "relative",
    zIndex: 2,
    maxWidth: "75%",
    marginTop: 8,
  };

  // big script "Welcome"
  const welcomeStyle: React.CSSProperties = {
    fontSize: 56,
    lineHeight: 1.05,
    color: BLUE,
    fontFamily: '"Lucida Handwriting", "Brush Script MT", cursive',
    fontWeight: 400,
    margin: 0,
    marginBottom: 12,
  };

  // serif-ish subtitle, bold, same blue
  const subtitleStyle: React.CSSProperties = {
    fontSize: 26,
    lineHeight: 1.1,
    color: BLUE,
    fontFamily: '"Times New Roman", Georgia, serif',
    fontWeight: 700,
    margin: 0,
    whiteSpace: "pre-line", // respect line breaks
  };

  // big circle of clouds – most of it is off-screen to mimic the mockup
  const circleWrapperStyle: React.CSSProperties = {
    position: "absolute",
    right: "-55%",      // push circle to the right so we only see the left arc
    bottom: "-75%",     // push it down so we only see the top-left of the circle
    width: "190%",
    height: "190%",
    borderRadius: "50%",
    overflow: "hidden",
    zIndex: 1,
  };

  const circleImageStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  // button area – floating above the clouds, centered horizontally
  const buttonWrapperStyle: React.CSSProperties = {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 70, // a bit above the bottom like in the design
    display: "flex",
    justifyContent: "center",
    zIndex: 3,
  };

  const buttonStyle: React.CSSProperties = {
    minWidth: 240,
    padding: "12px 32px",
    borderRadius: 999,
    border: "none",
    backgroundColor: BLUE, // blue pill
    color: "#ffffff",
    fontSize: 20,
    fontWeight: 600,
    fontFamily: '"Times New Roman", Georgia, serif',
    cursor: "pointer",
    boxShadow: "0 12px 25px rgba(0, 0, 0, 0.18)",
  };

  const handleBegin = () => {
    // your login is at "/"
    navigate("/emotional-balance");
  };

  return (
    <div style={screenStyle}>
      <div style={phoneStyle}>
        {/* TEXT */}
        <div style={textBlockStyle}>
          <h1 style={welcomeStyle}><strong>Welcome</strong></h1>
          <p style={subtitleStyle}>
            Here starts your{"\n"}
            journey to emotional{"\n"}
            balance.
          </p>
        </div>

        {/* BIG CIRCLE CLOUDS */}
        <div style={circleWrapperStyle}>
          <img src={cloudsBg} alt="Clouds" style={circleImageStyle} />
        </div>

        {/* BUTTON */}
        <div style={buttonWrapperStyle}>
          <button type="button" style={buttonStyle} onClick={handleBegin}>
            Begin Journey
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
