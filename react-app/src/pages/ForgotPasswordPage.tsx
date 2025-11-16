// react-app/src/pages/ForgotPasswordPage.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset, verifyPasswordReset } from "../api/auth";
import logo from "../assets/mendly-logo.jpg";

const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      await requestPasswordReset({ email });
      setMessage("A verification code has been sent to your email.");
      setStep(2);
    } catch (err: any) {
      console.error("Forgot password start error:", err);
      setError(
        err?.response?.data?.detail ??
          "Failed to send verification code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      await verifyPasswordReset({
        email,
        code,
        new_password: newPassword,
      });
      setMessage("Password updated successfully, you can login with the new password.");
    } catch (err: any) {
      console.error("Forgot password verify error:", err);
      setError(
        err?.response?.data?.detail ??
          "Failed to reset password. Please check the code and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ====== COLORS (same as login/signup) ======
  const BLUE = "#6BA7E6";
  const CREAM = "#f5e9d9";
  const BUTTON = "#F4C58F";
  const BUTTON_TEXT = "#3565AF";

  // ====== LAYOUT STYLES ======
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
    backgroundColor: BLUE,
    display: "flex",
    flexDirection: "column",
    margin: "0 auto",
    overflowY: "auto", // scroll if window is very short
  };

  const topSectionStyle: React.CSSProperties = {
    backgroundColor: CREAM,
    paddingTop: 40,
    paddingBottom: 32,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    position: "relative",
    overflow: "hidden",
  };

  const tornEdgeStyle: React.CSSProperties = {
    position: "absolute",
    bottom: -10,
    left: 0,
    right: 0,
    height: 30,
    background:
      "radial-gradient(circle at 0 100%, #ffffff 20%, transparent 21%),\
       radial-gradient(circle at 25% 100%, #ffffff 20%, transparent 21%),\
       radial-gradient(circle at 50% 100%, #ffffff 20%, transparent 21%),\
       radial-gradient(circle at 75% 100%, #ffffff 20%, transparent 21%),\
       radial-gradient(circle at 100% 100%, #ffffff 20%, transparent 21%)",
    backgroundSize: "40px 20px",
    backgroundRepeat: "repeat-x",
  };

  // circular logo like login/signup
  const logoCircleStyle: React.CSSProperties = {
    width: 120,
    height: 120,
    borderRadius: "50%",
    backgroundImage: `url(${logo})`,
    backgroundSize: "135%",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    boxShadow: `0 0 0 6px ${CREAM}`,
    marginBottom: 6,
  };

  const appNameStyle: React.CSSProperties = {
    color: "#5F8DD0",
    fontWeight: 600,
    fontSize: 15,
    marginTop: 4,
    marginBottom: 4,
  };

  const bottomSectionStyle: React.CSSProperties = {
    flex: 1,
    paddingTop: 40,
    paddingBottom: 32,
    paddingInline: 24,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: "white",
    backgroundColor: BLUE,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 4,
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: 14,
    opacity: 0.95,
    marginBottom: 22,
  };

  const pillWrapperStyle: React.CSSProperties = {
    width: "100%",
    marginBottom: 12,
    borderRadius: 999,
    backgroundColor: CREAM,
    paddingInline: 22,
    paddingBlock: 9,
    display: "flex",
    alignItems: "center",
  };

  const inputStyle: React.CSSProperties = {
    border: "none",
    outline: "none",
    background: "transparent",
    width: "100%",
    fontSize: 15,
    color: "#4B5563",
  };

  const buttonPillStyle: React.CSSProperties = {
    width: "100%",
    borderRadius: 999,
    backgroundColor: BUTTON,
    border: "none",
    paddingBlock: 12,
    fontSize: 16,
    fontWeight: 600,
    color: BUTTON_TEXT,
    cursor: "pointer",
    marginTop: 8,
  };

  const errorStyle: React.CSSProperties = {
    marginTop: 6,
    fontSize: 12,
    color: CREAM,
    textAlign: "center",
  };

  const messageStyle: React.CSSProperties = {
    marginTop: 6,
    fontSize: 12,
    color: "#d1fae5",
    textAlign: "center",
  };

  const linkStyle: React.CSSProperties = {
    marginTop: 16,
    fontSize: 13,
    color: "white",
    textDecoration: "none",
    textAlign: "center",
  };

  return (
    <div style={screenStyle}>
      <div style={phoneStyle}>
        {/* TOP / LOGO SECTION */}
        <div style={topSectionStyle}>
          <div style={logoCircleStyle} />
          <div style={appNameStyle}>Mendly App</div>
          <div style={tornEdgeStyle} />
        </div>

        {/* BOTTOM / FORGOT PASSWORD SECTION */}
        <div style={bottomSectionStyle}>
          <div style={titleStyle}>Reset Password</div>
          <div style={subtitleStyle}>
            {step === 1
              ? "Enter your email to receive a code"
              : "Enter the code and your new password"}
          </div>

          {step === 1 && (
            <form
              onSubmit={handleSendCode}
              style={{
                width: "80%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/* Email */}
              <div style={pillWrapperStyle}>
                <input
                  style={inputStyle}
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {message && <div style={messageStyle}>{message}</div>}
              {error && <div style={errorStyle}>{error}</div>}

              <button type="submit" style={buttonPillStyle} disabled={loading}>
                {loading ? "Sending code..." : "Send verification code"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form
              onSubmit={handleResetPassword}
              style={{
                width: "80%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/* Email (read only) */}
              <div style={pillWrapperStyle}>
                <input
                  style={inputStyle}
                  type="email"
                  value={email}
                  readOnly
                />
              </div>

              {/* Code */}
              <div style={pillWrapperStyle}>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="Verification code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>

              {/* New password */}
              <div style={pillWrapperStyle}>
                <input
                  style={inputStyle}
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              {message && <div style={messageStyle}>{message}</div>}
              {error && <div style={errorStyle}>{error}</div>}

              <button type="submit" style={buttonPillStyle} disabled={loading}>
                {loading ? "Updating..." : "Update password"}
              </button>
            </form>
          )}

          <Link to="/login" style={linkStyle}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
