// react-app/src/pages/PsychologistCompleteProfilePage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/mendly-logo.jpg";
import { API_BASE } from "../api/auth"; // ✅ uses 10.0.2.2 on native

type MeResponse = {
  user_id: string;
  username: string;
  email: string;
  age: number | null;
  gender: number | string | null;
  role: string;
  psychologist_profile?: {
    specialty?: string | null;
    workplace?: string | null;
    city?: string | null;
    bio?: string | null;
    years_experience?: number | null;
    license_number?: string | null;
  } | null;
};

const PsychologistCompleteProfilePage: React.FC = () => {
  const navigate = useNavigate();

  // Theme (same as your pages)
  const BLUE = "#6BA7E6";
  const CREAM = "#f5e9d9";
  const BUTTON = "#F4C58F";
  const BUTTON_TEXT = "#3565AF";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [specialty, setSpecialty] = useState("");
  const [workplace, setWorkplace] = useState("");
  const [city, setCity] = useState("");
  const [yearsExp, setYearsExp] = useState<string>("");
  const [bio, setBio] = useState("");

  const token = useMemo(() => localStorage.getItem("access_token") || "", []);

  // ===== logout =====
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  // ===== Load profile (prefill if exists) =====
  useEffect(() => {
    const load = async () => {
      try {
        if (!token) {
          navigate("/login", { replace: true });
          return;
        }

        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          logout();
          return;
        }

        const data: MeResponse = await res.json();

        if (data.role !== "psychologist") {
          navigate("/", { replace: true });
          return;
        }

        const p = data.psychologist_profile || {};
        setSpecialty(p.specialty || "");
        setWorkplace(p.workplace || "");
        setCity(p.city || "");
        setYearsExp(p.years_experience != null ? String(p.years_experience) : "");
        setBio(p.bio || "");
      } catch (e: any) {
        setError(e?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Progress bar: one step per field (bio counts only if filled)
  const progressCount =
    (specialty.trim() ? 1 : 0) +
    (workplace.trim() ? 1 : 0) +
    (city.trim() ? 1 : 0) +
    (yearsExp.trim() ? 1 : 0) +
    (bio.trim() ? 1 : 0);

  const progressTotal = 5;
  const progressPercent = Math.round((progressCount / progressTotal) * 100);

  // ===== Save =====
  const onSave = async () => {
    setError(null);

    // ✅ bio is NOT required
    if (!specialty.trim() || !workplace.trim() || !city.trim()) {
      setError("Please fill Specialty, Workplace, and City.");
      return;
    }

    const years = yearsExp.trim() === "" ? undefined : Number(yearsExp);
    if (
      years !== undefined &&
      (!Number.isFinite(years) || years < 0 || years > 80)
    ) {
      setError("Years of experience must be a valid number (0-80).");
      return;
    }

    // ✅ IMPORTANT: backend wants a STRING for bio, not null.
    // So if user leaves it empty -> send "".
    const payload = {
      specialty: specialty.trim(),
      workplace: workplace.trim(),
      city: city.trim(),
      years_experience: years,
      bio: bio.trim(), // "" is ok if empty
    };

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/auth/psychologist-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "Failed to save");
      }

      navigate("/psy", { replace: true });
    } catch (e: any) {
      setError(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // =================== STYLES ===================

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
    margin: "0 auto",
    backgroundColor: BLUE,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
  };

  // Header (ONLY logout on the right)
  const headerStyle: React.CSSProperties = {
    backgroundColor: CREAM,
    padding: "16px 16px",
    boxShadow: "0 6px 18px rgba(15,23,42,0.10)",
    boxSizing: "border-box",
  };

  const headerRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const appRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
  };

  const tinyLogoStyle: React.CSSProperties = {
    width: 38,
    height: 38,
    borderRadius: "50%",
    overflow: "hidden",
    backgroundColor: CREAM,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 14px rgba(0,0,0,0.08)",
  };

  const tinyLogoImgStyle: React.CSSProperties = {
    width: "180%",
    height: "180%",
    objectFit: "cover",
  };

  const appNameStyle: React.CSSProperties = {
    color: "#5F8DD0",
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 1,
  };

  const logoutBtn: React.CSSProperties = {
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    backgroundColor: BLUE,
    color: CREAM,
    fontSize: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflowY: "auto",
    padding: "18px 24px 24px 24px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: "white",
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: '"Times New Roman", Georgia, serif',
    fontSize: 28,
    fontWeight: 800,
    marginTop: 10,
    marginBottom: 8,
    textAlign: "center",
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: 14,
    opacity: 0.95,
    marginBottom: 14,
    textAlign: "center",
    maxWidth: 340,
    lineHeight: 1.35,
  };

  const progressWrap: React.CSSProperties = {
    width: "85%",
    marginBottom: 14,
  };

  const progressBarOuter: React.CSSProperties = {
    width: "100%",
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.35)",
    overflow: "hidden",
  };

  const progressBarInner: React.CSSProperties = {
    width: `${progressPercent}%`,
    height: "100%",
    borderRadius: 999,
    backgroundColor: BUTTON,
    transition: "width 250ms ease",
  };

  const cardStyle: React.CSSProperties = {
    width: "95%",
    backgroundColor: CREAM,
    borderRadius: 26,
    padding: "16px 16px",
    boxShadow: "0 12px 28px rgba(15,23,42,0.18)",
    boxSizing: "border-box",
    color: "#111827",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 900,
    color: "#3565AF",
    marginBottom: 6,
    marginLeft: 6,
  };

  const pillWrapperStyle: React.CSSProperties = {
    width: "100%",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.75)",
    paddingInline: 16,
    paddingBlock: 11,
    display: "flex",
    alignItems: "center",
    marginBottom: 12,
    boxSizing: "border-box",
    border: "1px solid rgba(53,101,175,0.12)",
  };

  const inputStyle: React.CSSProperties = {
    border: "none",
    outline: "none",
    background: "transparent",
    width: "100%",
    fontSize: 15,
    color: "#111827",
    fontWeight: 600,
  };

  const textareaWrap: React.CSSProperties = {
    width: "100%",
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.75)",
    padding: 12,
    boxSizing: "border-box",
    border: "1px solid rgba(53,101,175,0.12)",
    marginBottom: 12,
  };

  const textareaStyle: React.CSSProperties = {
    width: "100%",
    minHeight: 110,
    border: "none",
    outline: "none",
    background: "transparent",
    resize: "vertical",
    fontSize: 15,
    color: "#111827",
    fontWeight: 600,
    lineHeight: 1.45,
  };

  const errorTextStyle: React.CSSProperties = {
    marginTop: 6,
    marginBottom: 10,
    fontSize: 12,
    color: "#7f1d1d",
    fontWeight: 900,
    textAlign: "center",
  };

  const saveBtn: React.CSSProperties = {
    width: "85%",
    marginTop: 16,
    border: "none",
    borderRadius: 999,
    backgroundColor: BUTTON,
    color: BUTTON_TEXT,
    padding: "12px 14px",
    fontSize: 15,
    fontWeight: 900,
    cursor: saving ? "default" : "pointer",
    boxShadow: "0 10px 22px rgba(15,23,42,0.18)",
    opacity: saving ? 0.75 : 1,
  };

  const hintStyle: React.CSSProperties = {
    width: "85%",
    marginTop: 10,
    fontSize: 12,
    textAlign: "center",
    color: "rgba(255,255,255,0.92)",
    lineHeight: 1.35,
  };

  // =================== UI ===================

  return (
    <div style={screenStyle}>
      <div style={phoneStyle}>
        {/* HEADER (only logout) */}
        <div style={headerStyle}>
          <div style={headerRow}>
            <div style={appRow}>
              <div style={tinyLogoStyle}>
                <img src={logo} alt="Mendly logo" style={tinyLogoImgStyle} />
              </div>
              <div style={appNameStyle}>Mendly App</div>
            </div>

            <button
              type="button"
              style={logoutBtn}
              onClick={logout}
              aria-label="Logout"
              title="Logout"
            >
              🚪
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div style={contentStyle}>
          <div style={titleStyle}>Complete Your Profile</div>
          <div style={subtitleStyle}>
            Add your professional details so clients can understand your expertise.
          </div>

          <div style={progressWrap}>
            <div style={progressBarOuter}>
              <div style={progressBarInner} />
            </div>
          </div>

          <div style={cardStyle}>
            {loading ? (
              <div style={{ textAlign: "center", fontWeight: 900, color: "#3565AF" }}>
                Loading…
              </div>
            ) : (
              <>
                {error && <div style={errorTextStyle}>{error}</div>}

                <div style={labelStyle}>Specialty *</div>
                <div style={pillWrapperStyle}>
                  <input
                    style={inputStyle}
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="e.g., Trauma / PTSD"
                  />
                </div>

                <div style={labelStyle}>Workplace *</div>
                <div style={pillWrapperStyle}>
                  <input
                    style={inputStyle}
                    value={workplace}
                    onChange={(e) => setWorkplace(e.target.value)}
                    placeholder="Clinic / Hospital / Private"
                  />
                </div>

                <div style={labelStyle}>City *</div>
                <div style={pillWrapperStyle}>
                  <input
                    style={inputStyle}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City..."
                  />
                </div>

                <div style={labelStyle}>Years of experience</div>
                <div style={pillWrapperStyle}>
                  <input
                    style={inputStyle}
                    value={yearsExp}
                    onChange={(e) => setYearsExp(e.target.value)}
                    placeholder="e.g., 5"
                    inputMode="numeric"
                  />
                </div>

                {/* ✅ Bio optional */}
                <div style={labelStyle}>Bio (optional)</div>
                <div style={textareaWrap}>
                  <textarea
                    style={textareaStyle}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Bio (optional)..."
                  />
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            style={saveBtn}
            onClick={onSave}
            disabled={saving || loading}
          >
            {saving ? "Saving..." : "Save & Continue"}
          </button>

          <div style={hintStyle}>
            You must complete your profile to access the psychologist features.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PsychologistCompleteProfilePage;
