import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import logo from "../assets/mendly-logo.jpg";

const API_BASE = "http://localhost:8000";

const PsychologistIntakeViewerPage: React.FC = () => {
  const navigate = useNavigate();
  const { intakeId } = useParams();

  const BLUE = "#6BA7E6";
  const CREAM = "#f5e9d9";

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const pretty = useMemo(() => {
    const entries = Object.entries(answers || {});
    return entries.length ? entries : [];
  }, [answers]);

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

  const row: React.CSSProperties = {
    padding: "10px 12px",
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.65)",
    border: "1px solid rgba(53,101,175,0.12)",
    marginTop: 10,
  };

  const keyStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 900,
    color: "#3565AF",
  };

  const valStyle: React.CSSProperties = {
    marginTop: 4,
    fontSize: 13,
    fontWeight: 800,
    color: "#111827",
    whiteSpace: "pre-wrap",
  };

  useEffect(() => {
    const run = async () => {
      if (!intakeId) {
        setErr("Missing intake id");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErr(null);

        const token = localStorage.getItem("access_token");
        if (!token) return navigate("/login", { replace: true });

        const res = await fetch(`${API_BASE}/appointments/intake/${intakeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || "Failed to load intake.");
        }

        const data = await res.json();
        const raw = data.answers_json || "{}";
        const parsed = JSON.parse(raw);
        setAnswers(parsed);
      } catch (e: any) {
        setErr(e?.message || "Failed to load intake.");
        setAnswers({});
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [intakeId, navigate]);

  return (
    <div style={screenStyle}>
      <div style={phoneStyle}>
        <div style={headerWrap}>
          <div style={headerRow}>
            <button type="button" style={{ ...roundBtn, left: 0 }} onClick={() => navigate(-1)}>
              ←
            </button>

            <div style={titleTiny}>
              <span style={logoCircle}>
                <img src={logo} alt="Mendly logo" style={logoImg} />
              </span>
              Mendly App
            </div>

            <button type="button" style={{ ...roundBtn, right: 0 }} onClick={() => navigate("/psy/requests")}>
              📋
            </button>
          </div>
          <div style={pageTitle}>Intake Answers</div>
        </div>

        <div style={contentStyle}>
          {loading ? (
            <div style={{ color: CREAM, fontWeight: 900 }}>Loading...</div>
          ) : err ? (
            <div style={{ color: CREAM, fontWeight: 900 }}>{err}</div>
          ) : (
            <div style={card}>
              {pretty.length === 0 ? (
                <div style={{ fontWeight: 900, color: "#3565AF" }}>No answers.</div>
              ) : (
                pretty.map(([k, v]) => (
                  <div key={k} style={row}>
                    <div style={keyStyle}>{k}</div>
                    <div style={valStyle}>{String(v)}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PsychologistIntakeViewerPage;
