import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/mendly-logo.jpg";

const PsychologistHomePage: React.FC = () => {
  const navigate = useNavigate();

  // Theme
  const BLUE = "#6BA7E6";
  const CREAM = "#f5e9d9";
  const BTN = "#2a5f97";
  const BTN_TXT = "#f5e9d9";

  const screenStyle: React.CSSProperties = {
    height: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    backgroundColor: BLUE,
    fontFamily:
      '"Poppins", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  };

  const phoneStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: 450,
    height: "100%",
    backgroundColor: BLUE,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  };

  /* ===== HEADER ===== */
  const headerStyle: React.CSSProperties = {
  backgroundColor: CREAM,
  padding: "10px 16px",
  borderBottomLeftRadius: 12,
  borderBottomRightRadius: 12,
  position: "relative",
};

  const headerRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    height: 44,
  };

  const roundBtn: React.CSSProperties = {
    position: "absolute",
    top: 0,
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: "none",
    backgroundColor: BLUE,
    color: CREAM,
    fontSize: 20,
    cursor: "pointer",
  };

  const headerTitle: React.CSSProperties = {
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

  

  const bigTitle: React.CSSProperties = {
    marginTop: 10,
    textAlign: "center",
    fontSize: 32,
    fontWeight: 800,
    color: "#3565AF",
  };

  /* ===== CONTENT ===== */
  const contentStyle: React.CSSProperties = {
    flex: 1,
    padding: "16px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    overflowY: "auto",
  };

  const quoteBox: React.CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.35)",
  borderRadius: 24,
  padding: "18px 16px",
  textAlign: "center",
  fontWeight: 800,
  fontSize: 20,
  lineHeight: 1.4,
  color: "#0f172a",
  textShadow: "0 1px 2px rgba(0,0,0,0.15)",
};


  const grid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  };

  const pillBtn: React.CSSProperties = {
    border: "none",
    borderRadius: 999,
    backgroundColor: BTN,
    color: BTN_TXT,
    padding: "14px 10px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  };

  const card: React.CSSProperties = {
    backgroundColor: CREAM,
    borderRadius: 24,
    padding: 16,
    color: "#1f2937",
  };

  const cardTitle: React.CSSProperties = {
    margin: 0,
    fontSize: 20,
    fontWeight: 800,
    color: "#3565AF",
  };

  const ulStyle: React.CSSProperties = {
    marginTop: 10,
    paddingLeft: "1.2rem",
    fontSize: 14,
    lineHeight: 1.5,
  };

  /* ===== BOTTOM NAV ===== */
  const bottomNav: React.CSSProperties = {
    backgroundColor: CREAM,
    padding: "12px 22px",
    display: "flex",
    justifyContent: "space-between",
  };

  const navItem: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 18,
    fontWeight: 700,
    color: "#3565AF",
    cursor: "pointer",
  };
  const tinyLogoImgStyle: React.CSSProperties = {
      width: "130%",
      height: "130%",
      objectFit: "cover",
    };
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

  useEffect(() => {
  const run = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return navigate("/login", { replace: true });

    const res = await fetch("http://localhost:8000/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return navigate("/login", { replace: true });

    const data = await res.json();

    const p = data.psychologist_profile;
    const missing =
      !p ||
      !p.specialty ||
      !p.workplace ||
      !p.city ||
      !p.bio;

    if (data.role === "psychologist" && missing) {
      navigate("/psy/complete-profile", { replace: true });
    }
  };

  run();
}, [navigate]);

  
  return (
    <div style={screenStyle}>
      <div style={phoneStyle}>
        {/* HEADER */}
        <div style={headerStyle}>
          <div style={headerRow}>
            <button style={{ ...roundBtn, left: 0 }} onClick={() => navigate("/")}>
              🏠
            </button>

            <div style={titleBlockStyle}>
            <div style={smallLabelStyle}>
              <span style={tinyLogoStyle}>
                <img
                  src={logo}
                  alt="Mendly logo"
                  style={tinyLogoImgStyle}
                />
              </span>
              Mendly App
            </div>
          </div>

            <button
              style={{ ...roundBtn, right: 0 }}
              onClick={() => {
                localStorage.removeItem("access_token");
                navigate("/login");
              }}
            >
              🚪
            </button>
          </div>

        </div>

        {/* CONTENT */}
        <div style={contentStyle}>
          <div style={quoteBox}>
            “To give people the opportunity
            <br />
            for a healthy tomorrow!”
          </div>

          <div style={grid}>
            <button style={pillBtn} onClick={() => navigate("/psy/clients")}>
              My Clients
            </button>
            <button style={pillBtn} onClick={() => navigate("/psy/requests")}>
              Client Requests
            </button>
            <button style={pillBtn} onClick={() => navigate("/psy/sessions")}>
              Sessions & Notes
            </button>
            <button style={pillBtn} onClick={() => navigate("/psy/insights")}>
              Clinical Insights
            </button>
          </div>

          {/* POSTS / TODAY */}
          <div style={card}>
            <h3 style={cardTitle}>Today</h3>
            <ul style={ulStyle}>
              <li>Review pending client connection requests.</li>
              <li>Document session notes and clinical observations.</li>
              <li>
                Share therapeutic exercises (breathing, check-ins, mood tracking)
                with client consent.
              </li>
              <li>Monitor client engagement and progress trends.</li>
            </ul>
          </div>
        </div>

        {/* BOTTOM NAV */}
        <div style={bottomNav}>
          <div style={navItem} onClick={() => navigate("/psy/profile")}>
            👤 Profile
          </div>
          <div style={navItem} onClick={() => navigate("/psy/messages")}>
            💬 Messages
          </div>
        </div>
      </div>
    </div>
  );
};

export default PsychologistHomePage;
