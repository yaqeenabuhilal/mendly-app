// react-app/src/pages/SplashScreen.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import splash from "../assets/mendly-splash.jpg"; // your splash image

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const [dots, setDots] = useState(".");

  useEffect(() => {
    // Animate dots: ".", "..", "...", repeat
    const interval = setInterval(() => {
      setDots((prev) => (prev.length === 3 ? "." : prev + "."));
    }, 400);

    // After 2.5 seconds go to login
    const timeout = setTimeout(() => {
      navigate("/welcome");
    }, 2500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [navigate]);

  const screenStyle: React.CSSProperties = {
    height: "100vh",
    width: "100vw",
    margin: 0,
    padding: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5e9d9", // same cream tone
    fontFamily:
      '"Poppins", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  };

  const phoneStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    maxWidth: "450px",
    maxHeight: "900px",
    borderRadius: 40,
    overflow: "hidden",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.18)",
    position: "relative",
    backgroundImage: `url(${splash})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };

  // Loading text overlay (under the logo, centered horizontally)
  const loadingStyle: React.CSSProperties = {
    position: "absolute",
    bottom: 80, // adjust if you want higher/lower
    left: 0,
    right: 0,
    textAlign: "center",
    color: "#3565AF", // same blue used for buttons text
    fontSize: 18,
    fontWeight: 600,
    textShadow: "0 2px 6px rgba(0,0,0,0.15)",
  };

  return (
    <div style={screenStyle}>
      <div style={phoneStyle}>
        <div style={loadingStyle}>Loading{dots}</div>
      </div>
    </div>
  );
};

export default SplashScreen;
