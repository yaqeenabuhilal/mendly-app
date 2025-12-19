import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/mendly-logo.jpg";

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

  const BLUE = "#6BA7E6";
  const CREAM = "#f5e9d9";
  const BTN = "#2a5f97";
  const BTN_TXT = "#f5e9d9";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [specialty, setSpecialty] = useState("");
  const [workplace, setWorkplace] = useState("");
  const [city, setCity] = useState("");
  const [yearsExp, setYearsExp] = useState<string>("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [bio, setBio] = useState("");

  const token = useMemo(() => localStorage.getItem("access_token") || "", []);

  const screenStyle: React.CSSProperties = {
    height: "100vh",
    width: "100vw",
    margin: 0,
    padding: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "stretch",
    backgroundColor: BLUE,
    fontFamily: '"Poppins", system-ui, -apple-system, "Segoe UI", sans-serif',
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
    fontSize: 24,
    fontWeight: 900,
    color: "#3565AF",
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    padding: "14px 18px 14px 18px",
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
    padding: "16px",
    boxSizing: "border-box",
    boxShadow: "0 10px 25px rgba(15,23,42,0.18)",
    color: "#1f2937",
  };

  const label: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 800,
    color: "#3565AF",
    marginBottom: 6,
  };

  const input: React.CSSProperties = {
    width: "100%",
    borderRadius: 14,
    border: "1px solid rgba(53,101,175,0.25)",
    padding: "10px 12px",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.7)",
  };

  const textarea: React.CSSProperties = {
    ...input,
    minHeight: 90,
    resize: "vertical",
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
    opacity: saving ? 0.75 : 1,
  };

  useEffect(() => {
    const load = async () => {
      try {
        if (!token) {
          navigate("/login", { replace: true });
          return;
        }

        const res = await fetch("http://localhost:8000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          navigate("/login", { replace: true });
          return;
        }

        const data: MeResponse = await res.json();

        if (data.role !== "psychologist") {
          navigate("/", { replace: true });
          return;
        }

        // prefill if exists
        const p = data.psychologist_profile || {};
        setSpecialty(p.specialty || "");
        setWorkplace(p.workplace || "");
        setCity(p.city || "");
        setYearsExp(p.years_experience != null ? String(p.years_experience) : "");
        setLicenseNumber(p.license_number || "");
        setBio(p.bio || "");
      } catch (e: any) {
        setError(e?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate, token]);

  const onSave = async () => {
    setError(null);

    // required fields (اختاري شو إلزامي)
    if (!specialty.trim() || !workplace.trim() || !city.trim() || !bio.trim()) {
      setError("Please fill Specialty, Workplace, City, and Bio.");
      return;
    }

    const years =
  yearsExp.trim() === ""
    ? undefined
    : Number(yearsExp);

if (years !== undefined && (!Number.isFinite(years) || years < 0 || years > 80)) {
  setError("Years of experience must be a valid number.");
  return;
}


    setSaving(true);
    try {
      const res = await fetch("http://localhost:8000/auth/psychologist-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          specialty: specialty.trim(),
          workplace: workplace.trim(),
          city: city.trim(),
          bio: bio.trim(),
          years_experience: years,
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Failed to save");
      }

      navigate("/psy", { replace: true });
    } catch (e: any) {
      setError(e?.message || "Failed to save");
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
              onClick={() => {
                localStorage.removeItem("access_token");
                navigate("/login", { replace: true });
              }}
              aria-label="Logout"
              title="Logout"
            >
              🚪
            </button>
          </div>

          <div style={pageTitle}>Complete Your Profile</div>
        </div>

        <div style={contentStyle}>
          <div style={card}>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <>
                {error && (
                  <div style={{ marginBottom: 10, color: "#b91c1c", fontWeight: 700 }}>
                    {error}
                  </div>
                )}

                <div style={label}>Specialty *</div>
                <input style={input} value={specialty} onChange={(e) => setSpecialty(e.target.value)} />

                <div style={label}>Workplace *</div>
                <input style={input} value={workplace} onChange={(e) => setWorkplace(e.target.value)} />

                <div style={label}>City *</div>
                <input style={input} value={city} onChange={(e) => setCity(e.target.value)} />

                <div style={label}>Years of experience</div>
                <input
                  style={input}
                  value={yearsExp}
                  onChange={(e) => setYearsExp(e.target.value)}
                  placeholder="e.g., 5"
                />

                <div style={label}>Bio *</div>
                <textarea style={textarea} value={bio} onChange={(e) => setBio(e.target.value)} />

                <button type="button" style={primaryBtn} onClick={onSave} disabled={saving}>
                  {saving ? "Saving..." : "Save & Continue"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PsychologistCompleteProfilePage;
