// react-app/src/pages/ProfilePage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProfile,
  updateProfile,
  changePassword,
  type UserProfile,
} from "../api/auth";
import logo from "../assets/mendly-logo.jpg";

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();

  const BLUE = "#6BA7E6";
  const CREAM = "#f5e9d9";
  const BUTTON = "#F4C58F";
  const BUTTON_TEXT = "#3565AF";

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState<number>(0);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // password-change state
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdMessage, setPwdMessage] = useState<string | null>(null);

  // Load profile once on mount
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProfile();
        setProfile(data);
        setUsername(data.username);
        setEmail(data.email);
        setAge(typeof data.age === "number" ? data.age : "");
        setGender(typeof data.gender === "number" ? data.gender : 0);
      } catch (err: any) {
        console.error("Failed to load profile:", err);
        setError("Failed to load profile. Please log in again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSaveProfile = async () => {
    if (!profile) return;

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const updated = await updateProfile({
        username,
        email,
        age: age === "" ? undefined : Number(age),
        gender,
      });
      setProfile(updated);
      setMessage("Profile updated successfully.");
      setEditing(false);
    } catch (err: any) {
      console.error("Update profile error:", err);
      setError(
        err?.message ||
          "Failed to update profile. Please check your data and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancelProfile = () => {
    if (profile) {
      setUsername(profile.username);
      setEmail(profile.email);
      setAge(typeof profile.age === "number" ? profile.age : "");
      setGender(typeof profile.gender === "number" ? profile.gender : 0);
    }
    setEditing(false);
    setError(null);
    setMessage(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  const initial =
    profile && profile.username
      ? profile.username.trim().charAt(0).toUpperCase()
      : "M";

  const disableInputs = loading || !editing;

  // ===== password change handlers =====
  const handleOpenPwdForm = () => {
    setShowPwdForm(true);
    setEditing(false);
    setCurrentPwd("");
    setNewPwd("");
    setConfirmPwd("");
    setPwdError(null);
    setPwdMessage(null);
    setError(null);
    setMessage(null);
  };

  const handleCancelPwd = () => {
    setShowPwdForm(false);
    setCurrentPwd("");
    setNewPwd("");
    setConfirmPwd("");
    setPwdError(null);
    setPwdMessage(null);
  };

  const handleSavePwd = async () => {
    setPwdError(null);
    setPwdMessage(null);

    if (!currentPwd || !newPwd || !confirmPwd) {
      setPwdError("Please fill in all password fields.");
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError("New passwords do not match.");
      return;
    }

    try {
      setPwdSaving(true);
      await changePassword({
        current_password: currentPwd,
        new_password: newPwd,
      });
      setPwdMessage("Password changed successfully.");
      handleCancelPwd();
    } catch (err: any) {
      console.error("Change password error:", err);
      setPwdError(
        err?.message ||
          "Failed to change password. Please check your current password."
      );
    } finally {
      setPwdSaving(false);
    }
  };

  // ========== STYLES ==========

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
    maxWidth: "450px",
    margin: "0 auto",
    backgroundColor: BLUE,
    borderRadius: 0, // rectangle like other pages
    overflowY: "hidden",
    overflowX: "hidden",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
  };

  // TOP NAV (same pattern as Journey)
  const topSectionStyle: React.CSSProperties = {
    backgroundColor: CREAM,
    paddingTop: 20,
    paddingBottom: 16,
    paddingInline: 16,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // ⬅️ was "center"
    position: "relative",
    height: "40px",
  };

  const titleBlockStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    alignItems: "flex-start", // ⬅️ was "center" (keeps text on the left)
  };

  const smallLabelStyle: React.CSSProperties = {
    color: "#5F8DD0",
    fontSize: 18,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 6,
  };

  const avatarStyle: React.CSSProperties = {
    width: 50,
    height: 50,
    borderRadius: "50%",
    backgroundColor: BLUE,
    color: CREAM,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 26,
    fontWeight: 700,
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    marginTop: 12,
    marginBottom: 6,
  };

  const bottomSectionStyle: React.CSSProperties = {
    flex: 1,
    padding: "18px 24px 24px 24px",
    backgroundColor: BLUE,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: "white",
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontFamily: '"Times New Roman", Georgia, serif',
    fontSize: 24,
    marginBottom: 6,
    marginTop:30
  };

  const sectionSubtitleStyle: React.CSSProperties = {
    fontSize: 14,
    opacity: 0.95,
    marginBottom: 18,
    textAlign: "center",
  };

  const pillWrapperStyle: React.CSSProperties = {
    width: "100%",
    borderRadius: 999,
    backgroundColor: CREAM,
    paddingInline: 22,
    paddingBlock: 10,
    display: "flex",
    alignItems: "center",
    marginBottom: 12,
  };

  const inputStyle: React.CSSProperties = {
    border: "none",
    outline: "none",
    background: "transparent",
    width: "100%",
    fontSize: 15,
    color: "#4B5563",
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
    color: "#5F8DD0",
  };

  const buttonsRowStyle: React.CSSProperties = {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 10,
  };

  const primaryButtonStyle: React.CSSProperties = {
    flex: 1,
    borderRadius: 999,
    backgroundColor: BUTTON,
    border: "none",
    paddingBlock: 10,
    fontSize: 16,
    fontWeight: 600,
    color: BUTTON_TEXT,
    cursor: "pointer",
  };

  const secondaryButtonStyle: React.CSSProperties = {
    flex: 1,
    borderRadius: 999,
    backgroundColor: "transparent",
    border: "1px solid rgba(255,255,255,0.7)",
    paddingBlock: 10,
    fontSize: 16,
    fontWeight: 500,
    color: "white",
    cursor: "pointer",
  };

  const statusTextStyle: React.CSSProperties = {
    marginTop: 6,
    fontSize: 12,
    textAlign: "center",
  };

  const errorTextStyle: React.CSSProperties = {
    ...statusTextStyle,
    color: "#FDE2E1",
  };

  const successTextStyle: React.CSSProperties = {
    ...statusTextStyle,
    color: "#D1FAE5",
  };

  const changePwdButtonStyle: React.CSSProperties = {
    marginTop: 16,
    borderRadius: 999,
    backgroundColor: "#3970aaff",
    border: "1px solid rgba(255,255,255,0.7)",
    paddingBlock: 8,
    paddingInline: 20,
    fontSize: 14,
    fontWeight: 500,
    color: "white",
    cursor: "pointer",
  };

  const pwdFormContainerStyle: React.CSSProperties = {
    width: "85%",
    marginTop: 8,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  const tinyLogoStyle: React.CSSProperties = {
    width: 35,
    height: 35,
    borderRadius: "50%",
    overflow: "hidden",
    backgroundColor: CREAM,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const tinyLogoImgStyle: React.CSSProperties = {
    width: "180%",
    height: "180%",
    objectFit: "cover",
  };

  const appRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
  };

  // BOTTOM NAV (3 buttons: Home, Logout, Ai Chat)
  const bottomNavStyle: React.CSSProperties = {
    width: "100%",
    backgroundColor: CREAM,
    borderRadius: 0,
    padding: "10px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxSizing: "border-box",
    boxShadow: "0 -2px 10px rgba(15,23,42,0.15)",
    height:50
  };

  const navItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 10px",
    borderRadius: 999,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#3565AF",
    fontWeight: 600,
  };

  return (
    <div style={screenStyle}>
      <div style={phoneStyle}>
        {/* TOP NAV */}
        <div style={topSectionStyle}>
          <div style={titleBlockStyle}>
            <div style={appRowStyle}>
              <div style={tinyLogoStyle}>
                <img src={logo} alt="Mendly logo" style={tinyLogoImgStyle} />
              </div>
              <span style={smallLabelStyle}>Mendly App</span>
            </div>
          </div>

            <div style={avatarStyle}>{initial}</div>
        </div>

        {/* CONTENT */}
        <div style={bottomSectionStyle}>

          <div style={sectionTitleStyle}>
            {profile ? profile.username : "Loading..."}
          </div>

          <div style={sectionSubtitleStyle}>
            {showPwdForm
              ? "Update your password to keep your account secure."
              : "Review and update your personal details any time."}
          </div>

          {loading && <div style={{ marginBottom: 10 }}>Loading profile…</div>}

          {!loading && profile && !showPwdForm && (
            <>
              <form
                style={{
                  width: "85%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {/* Username */}
                <div style={pillWrapperStyle}>
                  <input
                    style={inputStyle}
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={disableInputs}
                    required
                  />
                </div>

                {/* Email */}
                <div style={pillWrapperStyle}>
                  <input
                    style={inputStyle}
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={disableInputs}
                    required
                  />
                </div>

                {/* Age */}
                <div style={pillWrapperStyle}>
                  <input
                    style={inputStyle}
                    type="number"
                    placeholder="Age"
                    value={age}
                    min={10}
                    max={120}
                    onChange={(e) =>
                      setAge(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    disabled={disableInputs}
                  />
                </div>

                {/* Gender */}
                <div style={pillWrapperStyle}>
                  <select
                    style={selectStyle}
                    value={gender}
                    onChange={(e) => setGender(Number(e.target.value))}
                    disabled={disableInputs}
                  >
                    <option value={0}>Prefer not to say</option>
                    <option value={1}>Female</option>
                    <option value={2}>Male</option>
                    <option value={3}>Other</option>
                  </select>
                  <span style={caretStyle}>▼</span>
                </div>

                {error && <div style={errorTextStyle}>{error}</div>}
                {message && <div style={successTextStyle}>{message}</div>}

                <div style={buttonsRowStyle}>
                  {editing ? (
                    <>
                      <button
                        type="button"
                        style={primaryButtonStyle}
                        onClick={handleSaveProfile}
                        disabled={saving}
                      >
                        {saving ? "Saving..." : "💾 Save"}
                      </button>
                      <button
                        type="button"
                        style={secondaryButtonStyle}
                        onClick={handleCancelProfile}
                      >
                        ↩️ Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      style={primaryButtonStyle}
                      onClick={() => setEditing(true)}
                    >
                      ✏️ Edit details
                    </button>
                  )}
                </div>
              </form>

              <button
                type="button"
                style={changePwdButtonStyle}
                onClick={handleOpenPwdForm}
              >
                🔒 Change password
              </button>
            </>
          )}

          {!loading && profile && showPwdForm && (
            <div style={pwdFormContainerStyle}>
              <div style={pillWrapperStyle}>
                <input
                  style={inputStyle}
                  type="password"
                  placeholder="Current password"
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                />
              </div>
              <div style={pillWrapperStyle}>
                <input
                  style={inputStyle}
                  type="password"
                  placeholder="New password"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                />
              </div>
              <div style={pillWrapperStyle}>
                <input
                  style={inputStyle}
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                />
              </div>

              {pwdError && <div style={errorTextStyle}>{pwdError}</div>}
              {pwdMessage && <div style={successTextStyle}>{pwdMessage}</div>}

              <div style={buttonsRowStyle}>
                <button
                  type="button"
                  style={primaryButtonStyle}
                  onClick={handleSavePwd}
                  disabled={pwdSaving}
                >
                  {pwdSaving ? "Saving..." : "💾 Save"}
                </button>
                <button
                  type="button"
                  style={secondaryButtonStyle}
                  onClick={handleCancelPwd}
                >
                  ↩️ Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM NAV */}
        <div style={bottomNavStyle}>
          <button
            type="button"
            style={navItemStyle}
            onClick={() => navigate("/journey")}
            aria-label="Home"
          >
            <span style={{ fontSize: 20 }}>🏠</span>
            <span>Home</span>
          </button>

          <button
            type="button"
            style={navItemStyle}
            onClick={() => navigate("/chat")}
            aria-label="AI Chat"
          >
            <span style={{ fontSize: 20 }}>💬</span>
            <span>Ai Chat</span>
          </button>

          <button
            type="button"
            style={navItemStyle}
            onClick={handleLogout}
            aria-label="Logout"
          >
            <span style={{ fontSize: 20 }}>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
