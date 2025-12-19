import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import logo from "../assets/mendly-logo.jpg";

const API_BASE = "http://localhost:8000";

type LocationState = { intake_id?: string };

const ChooseAppointmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: psychologistId } = useParams();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;

  const BLUE = "#6BA7E6";
  const CREAM = "#f5e9d9";

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!psychologistId) setErr("Missing psychologist id.");
    if (!state.intake_id) setErr("Missing intake id. Please restart the intake.");
  }, [psychologistId, state.intake_id]);

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

  const roundBtn: React.CSSProperties = {
    position: "absolute",
    top: 0,
    width: 44,
    height: 44,
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    backgroundColor: BLUE,
    color: CREAM,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 18px rgba(0,0,0,0.12)",
    fontSize: 20,
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

  const label: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 900,
    color: "#3565AF",
    marginBottom: 6,
  };

  const pill: React.CSSProperties = {
    width: "100%",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.65)",
    paddingInline: 16,
    paddingBlock: 12,
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box",
    border: "1px solid rgba(53,101,175,0.12)",
    marginBottom: 12,
  };

  const inputStyle: React.CSSProperties = {
    border: "none",
    outline: "none",
    background: "transparent",
    width: "100%",
    fontSize: 14,
    fontWeight: 800,
    color: "#111827",
  };

  const btnRow: React.CSSProperties = {
    display: "flex",
    gap: 10,
    marginTop: 8,
  };

  const primaryBtn: React.CSSProperties = {
    flex: 1,
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

  const secondaryBtn: React.CSSProperties = {
    flex: 1,
    borderRadius: 999,
    backgroundColor: "transparent",
    border: "2px solid rgba(42,95,151,0.35)",
    padding: "12px 14px",
    fontSize: 14,
    fontWeight: 900,
    color: "#3565AF",
    cursor: "pointer",
  };

  const errorStyle: React.CSSProperties = {
    marginTop: 6,
    fontSize: 12,
    fontWeight: 900,
    color: "#7f1d1d",
    textAlign: "center",
  };

  const handleSubmit = async () => {
    setErr(null);
    if (!psychologistId) return;
    if (!state.intake_id) {
      setErr("Missing intake id. Please restart the intake.");
      return;
    }
    if (!date || !time) {
      setErr("Please pick date and time.");
      return;
    }

    // local time to ISO with timezone (+02:00 in Israel)
    const iso = new Date(`${date}T${time}:00`).toISOString();

    try {
      setSaving(true);

      const token = localStorage.getItem("access_token");
      if (!token) return navigate("/login", { replace: true });

      const res = await fetch(`${API_BASE}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          psychologist_user_id: psychologistId,
          intake_id: state.intake_id,
          start_at: iso,
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Failed to request appointment.");
      }

      const data = await res.json();
      navigate("/appointment/submitted", { replace: true, state: { appointment: data } });
    } catch (e: any) {
      setErr(e?.message || "Failed to submit request.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={screenStyle}>
      <div style={phoneStyle}>
        <div style={headerWrap}>
          <div style={headerRow}>
            <button
              type="button"
              style={{ ...roundBtn, left: 0 }}
              onClick={() => navigate(-1)}
              aria-label="Back"
              title="Back"
            >
              ←
            </button>

            <div style={titleTiny}>
              <span style={logoCircle}>
                <img src={logo} alt="Mendly logo" style={logoImg} />
              </span>
              Mendly App
            </div>

            <button
              type="button"
              style={{ ...roundBtn, right: 0 }}
              onClick={() => navigate("/profile")}
              aria-label="Profile"
              title="Profile"
            >
              👤
            </button>
          </div>

          <div style={pageTitle}>Choose Date & Time</div>
        </div>

        <div style={contentStyle}>
          <div style={card}>
            <div style={label}>Date</div>
            <div style={pill}>
              <input style={inputStyle} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div style={label}>Time</div>
            <div style={pill}>
              <input style={inputStyle} type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>

            {err ? <div style={errorStyle}>{err}</div> : null}

            <div style={btnRow}>
              <button type="button" style={secondaryBtn} onClick={() => navigate(-1)} disabled={saving}>
                Back
              </button>
              <button type="button" style={primaryBtn} onClick={handleSubmit} disabled={saving}>
                {saving ? "Submitting..." : "Request Appointment"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChooseAppointmentPage;
