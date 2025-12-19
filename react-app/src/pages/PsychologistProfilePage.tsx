import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/mendly-logo.jpg";

type MeResponse = {
  user_id: string;
  username: string;
  email: string;
  age: number | null;
  gender: number | string | null;
  role: "regular" | "psychologist";
  psychologist_profile: null | {
    specialty: string | null;
    workplace: string | null;
    city: string | null;
    bio: string | null;
    years_experience: number | null;
    license_number: string | null;
  };
};

const PsychologistProfilePage: React.FC = () => {
  const navigate = useNavigate();

  const BLUE = "#6BA7E6";
  const CREAM = "#f5e9d9";
  const BTN = "#2a5f97";
  const BTN_TXT = "#f5e9d9";

  const API_BASE = "http://localhost:8000";

  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ===== Layout =====
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
    position: "relative",
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
    color: "#5F8DD0",
    fontWeight: 700,
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
    fontSize: 26,
    fontWeight: 900,
    color: "#3565AF",
  };

  // Content
  const contentStyle: React.CSSProperties = {
    flex: 1,
    padding: "14px 18px 14px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
    overflowY: "auto",
    boxSizing: "border-box",
  };

  const card: React.CSSProperties = {
    width: "100%",
    backgroundColor: CREAM,
    borderRadius: 24,
    padding: "16px",
    boxSizing: "border-box",
    boxShadow: "0 10px 25px rgba(15,23,42,0.18)",
    color: "#1f2937",
  };

  const label: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 800,
    color: "#3565AF",
    marginBottom: 4,
  };

  const value: React.CSSProperties = {
    fontSize: 14,
    color: "#111827",
    marginBottom: 12,
    lineHeight: 1.4,
  };

  const primaryBtn: React.CSSProperties = {
    border: "none",
    borderRadius: 999,
    backgroundColor: BTN,
    color: BTN_TXT,
    padding: "12px 14px",
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
    width: "100%",
  };

  // Bottom nav
  const bottomNav: React.CSSProperties = {
    width: "100%",
    backgroundColor: CREAM,
    padding: "12px 22px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxSizing: "border-box",
    boxShadow: "0 -2px 12px rgba(15,23,42,0.18)",
  };

  const navItem: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    color: "#3565AF",
    fontWeight: 800,
    userSelect: "none",
  };

  const navLabel: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 900,
    color: "#3565AF",
  };

  // ---------- helpers ----------
  const display = (v: unknown) => {
    if (v === null || v === undefined || v === "") return "-";
    return String(v);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  // ---------- fetch /auth/me ----------
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setLoading(false);
      setErrorMsg("No access token. Please login again.");
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const res = await fetch(`${API_BASE}/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(
            `Failed to load profile (${res.status}). ${txt ? txt : ""}`.trim()
          );
        }

        const data: MeResponse = await res.json();

        if (data.role !== "psychologist") {
          setMe(data);
          setLoading(false);
          return;
        }

        setMe(data);
        setLoading(false);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        setErrorMsg(err?.message || "Failed to load profile");
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  const psy = me?.psychologist_profile;

  return (
    <div style={screenStyle}>
      <div style={phoneStyle}>
        {/* HEADER */}
        <div style={headerWrap}>
          <div style={headerRow}>
            <button
              type="button"
              style={{ ...roundBtn, left: 0 }}
              onClick={() => navigate("/psy")}
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
              onClick={logout}
              aria-label="Logout"
              title="Logout"
            >
              🚪
            </button>
          </div>

          <div style={pageTitle}>My Profile</div>
        </div>

        {/* CONTENT */}
        <div style={contentStyle}>
          <div style={card}>
            {loading && (
              <div style={{ ...value, marginBottom: 0 }}>Loading...</div>
            )}

            {!loading && errorMsg && (
              <>
                <div style={label}>Error</div>
                <div style={{ ...value, marginBottom: 0 }}>{errorMsg}</div>
              </>
            )}

            {!loading && !errorMsg && me && (
              <>
                <div style={label}>Full name</div>
                <div style={value}>{display(me.username)}</div>

                <div style={label}>Email</div>
                <div style={value}>{display(me.email)}</div>

                <div style={label}>Specialty</div>
                <div style={value}>{display(psy?.specialty)}</div>

                <div style={label}>Workplace</div>
                <div style={value}>{display(psy?.workplace)}</div>

                <div style={label}>City</div>
                <div style={value}>{display(psy?.city)}</div>

                <div style={label}>Years of experience</div>
                <div style={value}>{display(psy?.years_experience)}</div>


                <div style={label}>Bio</div>
                <div style={{ ...value, marginBottom: 0 }}>
                  {display(psy?.bio)}
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            style={primaryBtn}
            onClick={() => navigate("/psy/profile/edit")}
            disabled={loading || !!errorMsg}
            title={loading ? "Loading..." : undefined}
          >
            Edit profile
          </button>
        </div>

        {/* BOTTOM NAV */}
        <div style={bottomNav}>
          <div style={navItem} onClick={() => navigate("/psy/profile")}>
            <span style={{ fontSize: 22 }}>👤</span>
            <span style={navLabel}>Profile</span>
          </div>

          <div style={navItem} onClick={() => navigate("/psy/messages")}>
            <span style={{ fontSize: 22 }}>💬</span>
            <span style={navLabel}>Messages</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PsychologistProfilePage;
