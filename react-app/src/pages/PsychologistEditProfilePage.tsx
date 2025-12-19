// react-app/src/pages/PsychologistEditProfilePage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/mendly-logo.jpg";

type MeResponse = {
  user_id: string;
  username: string;
  email: string;
  age?: number | null;
  gender?: number | null;
  role?: string;
  psychologist_profile?: {
    specialty?: string | null;
    workplace?: string | null;
    city?: string | null;
    bio?: string | null;
    years_experience?: number | null;
    license_number?: string | null;
  } | null;
};

const PsychologistEditProfilePage: React.FC = () => {
  const navigate = useNavigate();

  const BLUE = "#6BA7E6";
  const CREAM = "#f5e9d9";
  const BTN = "#2a5f97";
  const BTN_TXT = "#f5e9d9";

  const specialtyOptions = useMemo(
    () => [
      "CBT",
      "Anxiety Disorders",
      "Depression",
      "Trauma / PTSD",
      "Couples Therapy",
      "Child & Adolescent",
      "OCD",
      "Eating Disorders",
      "Stress Management",
      "Other",
    ],
    []
  );

  // ===== state =====
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [fullName, setFullName] = useState(""); // username
  const [email, setEmail] = useState("");

  // IMPORTANT: keep these so /auth/me update doesn't wipe them
  const [age, setAge] = useState<number | null>(null);
  const [gender, setGender] = useState<number | null>(null);

  const [specialty, setSpecialty] = useState("");
  const [customSpecialty, setCustomSpecialty] = useState("");

  const [workplace, setWorkplace] = useState("");
  const [city, setCity] = useState("");
  const [years, setYears] = useState<number | "">("");
  const [license, setLicense] = useState("");
  const [bio, setBio] = useState("");

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

  const pillWrapperStyle: React.CSSProperties = {
    width: "100%",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.55)",
    paddingInline: 16,
    paddingBlock: 10,
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
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    cursor: "pointer",
  };

  const caretStyle: React.CSSProperties = {
    marginLeft: 8,
    fontSize: 14,
    color: "#3565AF",
    fontWeight: 900,
  };

  const textAreaWrapper: React.CSSProperties = {
    width: "100%",
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.55)",
    padding: 12,
    boxSizing: "border-box",
    border: "1px solid rgba(53,101,175,0.12)",
  };

  const textareaStyle: React.CSSProperties = {
    width: "100%",
    minHeight: 90,
    border: "none",
    outline: "none",
    background: "transparent",
    resize: "vertical",
    fontSize: 15,
    color: "#111827",
    lineHeight: 1.4,
  };

  const row2: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  };

  const buttonsRowStyle: React.CSSProperties = {
    width: "100%",
    display: "flex",
    gap: 12,
    marginTop: 6,
  };

  const primaryBtn: React.CSSProperties = {
    flex: 1,
    border: "none",
    borderRadius: 999,
    backgroundColor: BTN,
    color: BTN_TXT,
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

  const statusText: React.CSSProperties = {
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
    color: "#0f172a",
    opacity: 0.9,
  };

  const errorText: React.CSSProperties = {
    ...statusText,
    color: "#7f1d1d",
    fontWeight: 800,
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

  // ===== load me =====
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("access_token");
        if (!token) return navigate("/login", { replace: true });

        const res = await fetch("http://localhost:8000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          localStorage.removeItem("access_token");
          return navigate("/login", { replace: true });
        }

        const data: MeResponse = await res.json();

        setFullName(data.username ?? "");
        setEmail(data.email ?? "");
        setAge(typeof data.age === "number" ? data.age : null);
        setGender(typeof data.gender === "number" ? data.gender : null);

        const p = data.psychologist_profile;
        const loadedSpecialty = (p?.specialty ?? "").trim();

        if (loadedSpecialty && specialtyOptions.includes(loadedSpecialty)) {
          setSpecialty(loadedSpecialty);
          setCustomSpecialty("");
        } else if (loadedSpecialty) {
          setSpecialty("Other");
          setCustomSpecialty(loadedSpecialty);
        } else {
          setSpecialty("");
          setCustomSpecialty("");
        }

        setWorkplace(p?.workplace ?? "");
        setCity(p?.city ?? "");
        setYears(typeof p?.years_experience === "number" ? p.years_experience : "");
        setLicense(p?.license_number ?? "");
        setBio(p?.bio ?? "");
      } catch {
        setError("Failed to load profile. Please log in again.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate, specialtyOptions]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login", { replace: true });
  };

  const finalSpecialty =
    specialty === "Other" ? customSpecialty.trim() : specialty.trim();

  const validate = () => {
    if (!fullName.trim()) return "Full name is required.";
    if (!email.trim()) return "Email is required.";
    if (!finalSpecialty) return "Specialty is required.";
    if (!workplace.trim()) return "Workplace is required.";
    if (!city.trim()) return "City is required.";
    if (!bio.trim()) return "Bio is required.";
    return null;
  };

  const handleSave = async () => {
    const v = validate();
    if (v) {
      setError(v);
      setMessage(null);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      const token = localStorage.getItem("access_token");
      if (!token) return navigate("/login", { replace: true });

      // 1) update Users (username/email) via PUT /auth/me
      const resUser = await fetch("http://localhost:8000/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: fullName.trim(),
          email: email.trim(),
          age: age ?? undefined,
          gender: gender ?? undefined,
        }),
      });

      if (!resUser.ok) {
        const t = await resUser.text();
        throw new Error(t || "Failed to update user info.");
      }

      // 2) update psychologist profile
      // IMPORTANT: endpoint is /psychologist-profile (no /auth) based on your router
      const resPsy = await fetch("http://localhost:8000/psychologist-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          specialty: finalSpecialty,
          workplace: workplace.trim(),
          city: city.trim(),
          bio: bio.trim(),
          years_experience: years === "" ? null : Number(years),
          license_number: license.trim() ? license.trim() : null,
        }),
      });

      if (!resPsy.ok) {
        const t = await resPsy.text();
        throw new Error(t || "Failed to update psychologist profile.");
      }

      setMessage("Profile updated successfully.");
      setTimeout(() => navigate("/psy/profile", { replace: true }), 400);
    } catch (e: any) {
      setError(e?.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={screenStyle}>
      <div style={phoneStyle}>
        {/* HEADER */}
        <div style={headerWrap}>
          <div style={headerRow}>
            <button
              type="button"
              style={{ ...roundBtn, left: 0 }}
              onClick={() => navigate("/psy/profile")}
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
              onClick={handleLogout}
              aria-label="Logout"
              title="Logout"
            >
              🚪
            </button>
          </div>

          <div style={pageTitle}>Edit Profile</div>
        </div>

        {/* CONTENT */}
        <div style={contentStyle}>
          <div style={card}>
            {loading ? (
              <div style={{ textAlign: "center", fontWeight: 800, color: "#3565AF" }}>
                Loading…
              </div>
            ) : (
              <>
                {/* Full name */}
                <div style={label}>Full name</div>
                <div style={pillWrapperStyle}>
                  <input
                    style={inputStyle}
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full name"
                  />
                </div>

                {/* Email */}
                <div style={label}>Email</div>
                <div style={pillWrapperStyle}>
                  <input
                    style={inputStyle}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                  />
                </div>

                {/* Specialty */}
                <div style={label}>Specialty</div>
                <div style={pillWrapperStyle}>
                  <select
                    style={selectStyle}
                    value={specialty}
                    onChange={(e) => {
                      setSpecialty(e.target.value);
                      if (e.target.value !== "Other") setCustomSpecialty("");
                    }}
                  >
                    <option value="">Select specialty</option>
                    {specialtyOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <span style={caretStyle}>▼</span>
                </div>

                {specialty === "Other" && (
                  <>
                    <div style={label}>Custom specialty</div>
                    <div style={pillWrapperStyle}>
                      <input
                        style={inputStyle}
                        type="text"
                        value={customSpecialty}
                        onChange={(e) => setCustomSpecialty(e.target.value)}
                        placeholder="Write your specialty"
                      />
                    </div>
                  </>
                )}

                {/* Workplace + City */}
                <div style={row2}>
                  <div>
                    <div style={label}>Workplace</div>
                    <div style={pillWrapperStyle}>
                      <input
                        style={inputStyle}
                        type="text"
                        value={workplace}
                        onChange={(e) => setWorkplace(e.target.value)}
                        placeholder="Clinic / Hospital / Private"
                      />
                    </div>
                  </div>

                  <div>
                    <div style={label}>City</div>
                    <div style={pillWrapperStyle}>
                      <input
                        style={inputStyle}
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                      />
                    </div>
                  </div>
                </div>

                {/* Years + License */}
                <div style={row2}>
                  <div>
                    <div style={label}>Years of experience</div>
                    <div style={pillWrapperStyle}>
                      <input
                        style={inputStyle}
                        type="number"
                        min={0}
                        max={80}
                        value={years}
                        onChange={(e) =>
                          setYears(e.target.value === "" ? "" : Number(e.target.value))
                        }
                        placeholder="e.g. 4"
                      />
                    </div>
                  </div>

                  <div>
                    <div style={label}>License number</div>
                    <div style={pillWrapperStyle}>
                      <input
                        style={inputStyle}
                        type="text"
                        value={license}
                        onChange={(e) => setLicense(e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div style={label}>Bio</div>
                <div style={textAreaWrapper}>
                  <textarea
                    style={textareaStyle}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Write a short bio for clients (required)"
                  />
                </div>

                {error && <div style={errorText}>{error}</div>}
                {message && <div style={statusText}>{message}</div>}

                <div style={buttonsRowStyle}>
                  <button
                    type="button"
                    style={secondaryBtn}
                    onClick={() => navigate("/psy/profile")}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    style={primaryBtn}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </>
            )}
          </div>
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

export default PsychologistEditProfilePage;
