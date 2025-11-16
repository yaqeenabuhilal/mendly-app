// react-app/src/pages/JourneyOverviewPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/mendly-logo.jpg";
import heroImage from "../assets/peace-quote.png";

const JourneyOverviewPage: React.FC = () => {
  const navigate = useNavigate();

  const BLUE = "#6BA7E6";
  const CREAM = "#f5e9d9";

  // ===== Mood tracking tips for the Posts card =====
  const moodTips: string[] = [
    "Notice how your sleep affects your mood.",
    "Track how different foods make you feel.",
    "Write down how movement or exercise changes your emotions.",
    "Pay attention to how time with people impacts your mood.",
    "Name your emotions — it can reduce their intensity.",
    "Look for patterns between your daily habits and how you feel.",
    "Use what you learn to make choices that support your well-being.",
  ];

  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-rotate tips every 5 seconds (when not paused)
  useEffect(() => {
    if (isPaused) return;

    const id = window.setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % moodTips.length);
    }, 5000);

    return () => window.clearInterval(id);
  }, [isPaused, moodTips.length]);

  const handleHoldStart = () => setIsPaused(true);
  const handleHoldEnd = () => setIsPaused(false);

  const secondTipIndex = (currentTipIndex + 1) % moodTips.length;
  const thirdTipIndex = (secondTipIndex + 1) % moodTips.length;
  // ===== STYLES =====
  const screenStyle: React.CSSProperties = {
    height: "100vh",
    width: "100vw",
    margin: 0,
    padding: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "stretch",
    backgroundColor: BLUE,
    fontFamily:
      '"Poppins", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  };

  const phoneStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    maxWidth: "450px",
    margin: "0 auto",
    backgroundColor: BLUE,
    borderRadius: 0,          // ⬅️ was "0 0 32px 32px" – now a full rectangle
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    position: "relative",
  };


  // full-width rectangular nav bar
  const topSectionStyle: React.CSSProperties = {
    backgroundColor: CREAM,
    paddingTop: 20,
    paddingBottom: 16,
    paddingInline: 16,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    height: "30px",
  };

  const iconBtn: React.CSSProperties = {
    position: "absolute",
    top: 14,
    width: 42,
    height: 42,
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    backgroundColor: "#3970aaff",
    color: CREAM,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
  };

  const homeBtnStyle: React.CSSProperties = { ...iconBtn, left: 12 };
  const logoutBtnStyle: React.CSSProperties = { ...iconBtn, right: 12 };

  const titleBlockStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    alignItems: "center",
  };

  const smallLabelStyle: React.CSSProperties = {
    color: "#5F8DD0",
    fontSize: 20,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 6,
  };

  const tinyLogoStyle: React.CSSProperties = {
    width: 28,
    height: 28,
    borderRadius: "50%",
    overflow: "hidden",
    backgroundColor: CREAM,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const tinyLogoImgStyle: React.CSSProperties = {
    width: "130%",
    height: "130%",
    objectFit: "cover",
  };

  // CONTENT AREA – remove big bottom padding
const bottomSectionStyle: React.CSSProperties = {
  flex: 1,
  padding: "0 0 16px 0",   // ⬅️ no 90px bottom padding
  backgroundColor: BLUE,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  color: "white",
  gap: 16,
  overflowY: "auto",
  overflowX: "hidden",
};


  // inner container for buttons + posts
  const innerContentStyle: React.CSSProperties = {
    width: "100%",
    padding: "0 22px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    alignItems: "center",
  };

  const cardStyle: React.CSSProperties = {
    width: "100%",
    backgroundColor: CREAM,
    borderRadius: 24,
    padding: "14px 16px 16px 16px",
    color: "#374151",
    boxShadow: "0 10px 25px rgba(15,23,42,0.18)",
    boxSizing: "border-box",
  };

  // === HERO IMAGE FULL-WIDTH, right under nav ===
  const heroImageCard: React.CSSProperties = {
    width: "100%",
    height: 150,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const heroMediaStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  };

  const actionBtn: React.CSSProperties = {
    border: "none",
    cursor: "pointer",
    borderRadius: 999,
    backgroundColor: "#2a5f97ff",
    color: CREAM,
    padding: "12px 14px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
    fontWeight: 700,
    width: "100%",
  };

  // BOTTOM NAV – full-width rectangle, same general height as before
const bottomNavStyle: React.CSSProperties = {
  width: "100%",                 // full width of phone
  backgroundColor: CREAM,
  borderRadius: 0,               // rectangle (top edge straight)
  padding: "10px 24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  boxSizing: "border-box",
  boxShadow: "0 -2px 10px rgba(15,23,42,0.15)",
  height: 50
};



  const navItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 10px",
    borderRadius: 999,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#3565AF",
    fontWeight: 600,
  };

  const bulletListStyle: React.CSSProperties = {
    listStyleType: "disc",
    paddingLeft: "1.2rem",
    margin: 0,
  };

  const bulletItemStyle: React.CSSProperties = {
    fontSize: 13,
    opacity: 0.9,
    lineHeight: 1.4,
  };

  const helperPauseStyle: React.CSSProperties = {
    marginTop: 8,
    fontSize: 11,
    opacity: 0.65,
  };

  return (
    <div style={screenStyle}>
      <div style={phoneStyle}>
        {/* HEADER */}
        <div style={topSectionStyle}>
          <button
            type="button"
            style={homeBtnStyle}
            onClick={() => navigate("/journey")}
            aria-label="Home"
            title="Home"
          >
            🏠
          </button>

          <div style={titleBlockStyle}>
            <div style={smallLabelStyle}>
              <span style={tinyLogoStyle}>
                <img src={logo} alt="Mendly logo" style={tinyLogoImgStyle} />
              </span>
              Mendly App
            </div>
          </div>

          <button
            type="button"
            style={logoutBtnStyle}
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("access_token");
              navigate("/login", { replace: true });
            }}
            aria-label="Logout"
            title="Log out"
          >
            🚪
          </button>
        </div>

        {/* CONTENT */}
        <div style={bottomSectionStyle}>
          {/* Hero image full width, directly under nav */}
          <div style={heroImageCard}>
            <img
              src={heroImage}
              alt="You have the power to protect your peace"
              style={heroMediaStyle}
            />
          </div>

          <div style={innerContentStyle}>
            {/* four main buttons */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                width: "100%",
              }}
            >
              <button
                type="button"
                style={{ ...actionBtn, paddingBlock: 14 }}
                onClick={() => navigate("/check-in")}
              >
                Check in
              </button>

              <button
                type="button"
                style={{ ...actionBtn, paddingBlock: 14 }}
                onClick={() => navigate("/positive")}
              >
                Positive Notifications
              </button>

              <button
                type="button"
                style={{ ...actionBtn, paddingBlock: 14 }}
                onClick={() => navigate("/breath")}
              >
                Breath Training
              </button>

              <button
                type="button"
                style={{ ...actionBtn, paddingBlock: 14 }}
                onClick={() => navigate("/mood-track")}
              >
                Mood Track
              </button>
            </div>

            {/* Posts teaser – rotating tips (2 at a time) */}
            <div
              style={{ ...cardStyle }}
              onMouseDown={handleHoldStart}
              onMouseUp={handleHoldEnd}
              onMouseLeave={handleHoldEnd}
              onTouchStart={handleHoldStart}
              onTouchEnd={handleHoldEnd}
            >
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Posts</div>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                Why Mood Tracking Works
              </div>
              <ul style={bulletListStyle}>
                <li style={bulletItemStyle}>{moodTips[currentTipIndex]}</li>
                <li style={bulletItemStyle}>{moodTips[secondTipIndex]}</li>
                <li style={bulletItemStyle}>{moodTips[thirdTipIndex]}</li>
              </ul>
              <div style={helperPauseStyle}>
                {isPaused
                  ? "Release to keep exploring more tips."
                  : "Tap & hold to pause these tips."}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM NAV */}
        <div style={bottomNavStyle}>
          <div
            style={navItemStyle}
            onClick={() => navigate("/profile")}
            role="button"
            aria-label="Profile"
          >
            <div style={{ fontSize: 22 }}>👤</div>
            <div>Profile</div>
          </div>

          <div
            style={navItemStyle}
            onClick={() => navigate("/chat")}
            role="button"
            aria-label="AI Chat"
          >
            <div style={{ fontSize: 22 }}>💬</div>
            <div>Ai Chat</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JourneyOverviewPage;
