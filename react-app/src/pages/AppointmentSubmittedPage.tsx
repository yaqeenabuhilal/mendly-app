import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/mendly-logo.jpg";

const AppointmentSubmittedPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const appointment = (location.state as any)?.appointment;

  const BLUE = "#6BA7E6";
  const CREAM = "#f5e9d9";

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
    maxWidth: 450,
    backgroundColor: BLUE,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  };

  const headerWrap: React.CSSProperties = {
    backgroundColor: CREAM,
    paddingTop: 14,
    paddingBottom: 14,
    paddingInline: 16,
    boxSizing: "border-box",
  };

  const headerRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    minHeight: 44,
  };

  const titleTiny: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#3565AF",
    fontWeight: 900,
    fontSize: 18,
  };

  const logoCircle: React.CSSProperties = {
    width: 28,
    height: 28,
    borderRadius: "50%",
    overflow: "hidden",
    backgroundColor: CREAM,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const logoImg: React.CSSProperties = {
    width: "130%",
    height: "130%",
    objectFit: "cover",
  };

  const pageTitle: React.CSSProperties = {
    margin: "10px 0 0",
    textAlign: "center",
    fontSize: 22,
    fontWeight: 900,
    color: "#3565AF",
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    padding: "14px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    overflowY: "auto",
    boxSizing: "border-box",
  };

  const card: React.CSSProperties = {
    width: "100%",
    backgroundColor: CREAM,
    borderRadius: 18,
    padding: 14,
    boxSizing: "border-box",
    boxShadow: "0 10px 25px rgba(15,23,42,0.18)",
    color: "#111827",
  };

  const primaryBtn: React.CSSProperties = {
    width: "100%",
    border: "none",
    borderRadius: 999,
    backgroundColor: "#2a5f97",
    color: CREAM,
    padding: "12px 14px",
    fontSize: 14,
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
  };

  return (
    <div style={screenStyle}>
      <div style={phoneStyle}>
        <div style={headerWrap}>
          <div style={headerRow}>
            <div style={titleTiny}>
              <span style={logoCircle}>
                <img src={logo} alt="Mendly logo" style={logoImg} />
              </span>
              Mendly App
            </div>
          </div>
          <div style={pageTitle}>Request Sent</div>
        </div>

        <div style={contentStyle}>
          <div style={card}>
            <div style={{ fontWeight: 900, color: "#3565AF" }}>
              Your appointment request has been submitted.
            </div>

            {appointment ? (
              <div style={{ marginTop: 10, fontSize: 13, fontWeight: 800 }}>
                <div>status: {appointment.status}</div>
                <div>start: {String(appointment.start_at)}</div>
              </div>
            ) : null}

            <button
              type="button"
              style={{ ...primaryBtn, marginTop: 14 }}
              onClick={() => navigate("/profile", { replace: true })}
            >
              Back to Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentSubmittedPage;
