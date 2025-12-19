import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/mendly-logo.jpg";

type PsychologistProfile = {
  specialty?: string | null;
  workplace?: string | null;
  city?: string | null;
  bio?: string | null;
  years_experience?: number | null;
  license_number?: string | null;
};

type Psychologist = {
  user_id: string;
  username: string;
  email?: string;
  role?: string;

  psychologist_profile?: PsychologistProfile | null;

  specialty?: string | null;
  workplace?: string | null;
  city?: string | null;
  bio?: string | null;
  years_experience?: number | null;
  license_number?: string | null;
};

const PsychologistsDirectoryPage: React.FC = () => {
  const navigate = useNavigate();

  const BLUE = "#6BA7E6";
  const CREAM = "#f5e9d9";

  const [items, setItems] = useState<Psychologist[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

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

  const searchStyle: React.CSSProperties = {
    width: "100%",
    borderRadius: 999,
    border: "none",
    padding: "12px 14px",
    fontSize: 14,
    fontWeight: 800,
    outline: "none",
    boxSizing: "border-box",
    boxShadow: "0 10px 25px rgba(15,23,42,0.18)",
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

  const nameStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 16,
    fontWeight: 900,
    color: "#1f2937",
  };

  const metaStyle: React.CSSProperties = {
    margin: "6px 0 0",
    fontSize: 13,
    fontWeight: 800,
    color: "#3565AF",
  };

  const bioStyle: React.CSSProperties = {
    margin: "8px 0 0",
    fontSize: 13,
    fontWeight: 700,
    color: "#111827",
    lineHeight: 1.45,
  };

  const smallBtn: React.CSSProperties = {
    marginTop: 12,
    width: "100%",
    border: "none",
    borderRadius: 12,
    padding: "10px 12px",
    cursor: "pointer",
    backgroundColor: "#2a5f97",
    color: "#f5e9d9",
    fontWeight: 900,
    fontSize: 14,
    boxShadow: "0 10px 20px rgba(0,0,0,0.14)",
  };

  // ===== fetch =====
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const url = new URL("http://localhost:8000/psychologists");
        if (q.trim()) url.searchParams.set("q", q.trim());

        const res = await fetch(url.toString());
        const data = await res.json();

        setItems(Array.isArray(data) ? data : []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    const t = setTimeout(run, 250);
    return () => clearTimeout(t);
  }, [q]);

  const rendered = useMemo(() => items, [items]);

  return (
    <div style={screenStyle}>
      <div style={phoneStyle}>
        {/* HEADER */}
        <div style={headerWrap}>
          <div style={headerRow}>
            <button
              type="button"
              style={{ ...roundBtn, left: 0 }}
              onClick={() => navigate("/emotional-balance")}
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

          <div style={pageTitle}>Find a Psychologist</div>
        </div>

        {/* CONTENT */}
        <div style={contentStyle}>
          <input
            style={searchStyle}
            placeholder="Search by name, specialty, city..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          {loading ? (
            <div style={{ color: CREAM, fontWeight: 900 }}>Loading...</div>
          ) : rendered.length === 0 ? (
            <div style={{ color: CREAM, fontWeight: 900 }}>
              No psychologists found.
            </div>
          ) : (
            rendered.map((p) => {
              const prof = p.psychologist_profile ?? null;

              const specialty = prof?.specialty ?? p.specialty ?? "—";
              const city = prof?.city ?? p.city ?? "—";
              const workplace = prof?.workplace ?? p.workplace ?? "";
              const years =
                prof?.years_experience ?? p.years_experience ?? null;
              const bio = prof?.bio ?? p.bio ?? "";

              return (
                <div key={p.user_id} style={card}>
                  <h3 style={nameStyle}>{p.username}</h3>

                  <div style={metaStyle}>
                    {specialty} • {city}
                  </div>

                  <div style={{ ...metaStyle, color: "#1f2937", fontWeight: 800 }}>
                    {workplace}
                    {years != null ? ` • ${years} yrs` : ""}
                  </div>

                  {bio ? <p style={bioStyle}>{bio}</p> : null}

                  <button
                    type="button"
                    style={smallBtn}
                    onClick={() => navigate(`/psychologists/${p.user_id}`)}
                  >
                    View Profile
                  </button>

                  <button
                    type="button"
                    style={smallBtn}
                    onClick={() => navigate(`/psychologists/${p.user_id}/intake`)}
                  >
                    Book appointment
                  </button>

                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default PsychologistsDirectoryPage;
