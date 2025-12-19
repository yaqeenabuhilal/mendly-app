// react-app/src/pages/PsychologistPublicProfilePage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import logo from "../assets/mendly-logo.jpg";

type Psychologist = {
  user_id: string;
  username: string;
  email?: string | null;

  specialty?: string | null;
  workplace?: string | null;
  city?: string | null;
  bio?: string | null;
  years_experience?: number | null;
  license_number?: string | null;
};

const PsychologistPublicProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const BLUE = "#6BA7E6";
  const CREAM = "#f5e9d9";
  const BTN = "#2a5f97";

  const [item, setItem] = useState<Psychologist | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // ===== styles =====
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
    fontSize: 24,
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
    borderRadius: 24,
    padding: 16,
    boxSizing: "border-box",
    boxShadow: "0 10px 25px rgba(15,23,42,0.18)",
    color: "#111827",
  };

  const nameStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 20,
    fontWeight: 900,
    color: "#1f2937",
  };

  const divider: React.CSSProperties = {
    height: 1,
    width: "100%",
    backgroundColor: "rgba(53,101,175,0.18)",
    margin: "12px 0",
  };

  const label: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 900,
    color: "#3565AF",
    marginBottom: 4,
  };

  const value: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 800,
    color: "#111827",
    marginBottom: 12,
    lineHeight: 1.45,
    whiteSpace: "pre-wrap",
  };

  const smallBtn: React.CSSProperties = {
    width: "100%",
    border: "none",
    borderRadius: 999,
    padding: "12px 14px",
    cursor: "pointer",
    backgroundColor: BTN,
    color: CREAM,
    fontWeight: 900,
    fontSize: 14,
    boxShadow: "0 10px 20px rgba(0,0,0,0.14)",
    marginTop: 6,
  };

  // ===== fetch =====
  useEffect(() => {
    const run = async () => {
      if (!id) {
        setErr("Missing psychologist id");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErr(null);

        const res = await fetch(`http://localhost:8000/psychologists/${id}`);
        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || "Failed to load psychologist");
        }

        const data = (await res.json()) as Psychologist;
        setItem(data);
      } catch (e: any) {
        setItem(null);
        setErr(e?.message || "Failed to load psychologist profile");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id]);

  const safe = (v?: string | null) => (v && v.trim() ? v : "—");

  return (
    <div style={screenStyle}>
      <div style={phoneStyle}>
        {/* HEADER */}
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

          <div style={pageTitle}>Psychologist Profile</div>
        </div>

        {/* CONTENT */}
        <div style={contentStyle}>
          {loading ? (
            <div style={{ color: CREAM, fontWeight: 900 }}>Loading...</div>
          ) : err ? (
            <div style={{ color: CREAM, fontWeight: 900 }}>{err}</div>
          ) : !item ? (
            <div style={{ color: CREAM, fontWeight: 900 }}>Not found.</div>
          ) : (
            <div style={card}>
              <h2 style={nameStyle}>{safe(item.username)}</h2>

              <div style={divider} />

              <div style={label}>Specialty</div>
              <div style={value}>{safe(item.specialty)}</div>

              <div style={label}>City</div>
              <div style={value}>{safe(item.city)}</div>

              <div style={label}>Workplace</div>
              <div style={value}>{safe(item.workplace)}</div>

              <div style={label}>Years of experience</div>
              <div style={value}>
                {item.years_experience != null ? item.years_experience : "—"}
              </div>

              <div style={label}>Bio</div>
              <div style={{ ...value, marginBottom: 0 }}>{safe(item.bio)}</div>

              {/* optional button (later: start chat / request appointment) */}
              <button
                type="button"
                style={smallBtn}
                onClick={() => navigate(-1)}
              >
                Back to list
              </button>

              <button
                type="button"
                style={smallBtn}
                onClick={() => navigate(`/psychologists/${id}/intake`)}
              >
                Request appointment
              </button>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PsychologistPublicProfilePage;
