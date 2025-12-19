import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import logo from "../assets/mendly-logo.jpg"; // <-- your logo file
import { registerDeviceWithBackend } from "../utils/registerDevice";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = await login({ username, password });

    localStorage.setItem("access_token", token.access_token);

    localStorage.setItem(
      "user",
      JSON.stringify({
        user_id: token.user_id,
        username: token.username,
        role: token.role,
      })
    );

    if (token.role === "psychologist") {
      navigate("/psy");
    } else {
      navigate("/journey");
    }

    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ??
        err?.message ??
        "Login failed";

      // show in component state (for web / under form)
      setError(msg);

      // show as popup on phone
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  // ====== COLORS ======
  const BLUE = "#6BA7E6";
  const CREAM = "#f5e9d9";

  // ====== INLINE STYLES ======

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
      '"Poppins", system-ui, -apple-system, BlinkMacSystemFont,"Segoe UI", sans-serif',
  };

  const phoneStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    maxWidth: "450px",
    backgroundColor: BLUE,
    display: "flex",
    flexDirection: "column",
    margin: "0 auto",
    position: "relative",
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

  // round home icon button in the header
  const homeIconButtonStyle: React.CSSProperties = {
    position: "absolute",
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "none",
    backgroundColor: BLUE,
    color: CREAM,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
    cursor: "pointer",
    fontSize: 20,
  };

  const tornEdgeStyle: React.CSSProperties = {
    position: "absolute",
    bottom: -10,
    left: 0,
    right: 0,
    height: 30,
    background:
      "radial-gradient(circle at 0 100%, #ffffff 20%, transparent 21%)," +
      "radial-gradient(circle at 25% 100%, #ffffff 20%, transparent 21%)," +
      "radial-gradient(circle at 50% 100%, #ffffff 20%, transparent 21%)," +
      "radial-gradient(circle at 75% 100%, #ffffff 20%, transparent 21%)," +
      "radial-gradient(circle at 100% 100%, #ffffff 20%, transparent 21%)",
    backgroundSize: "40px 20px",
    backgroundRepeat: "repeat-x",
  };

  const logoWrapperStyle: React.CSSProperties = {
    width: 140,
    height: 140,
    borderRadius: "50%",
    overflow: "hidden",
    backgroundColor: CREAM,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  };

  const logoImageStyle: React.CSSProperties = {
    width: "140%",
    height: "140%",
    objectFit: "cover",
  };

  const appNameStyle: React.CSSProperties = {
    color: "#5F8DD0",
    fontWeight: 600,
    fontSize: 16,
    marginTop: 6,
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
    fontSize: 26,
    fontWeight: 700,
    marginBottom: 4,
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: 14,
    opacity: 0.95,
    marginBottom: 28,
  };

  const pillWrapperStyle: React.CSSProperties = {
    width: "100%",
    marginBottom: 14,
    borderRadius: 999,
    backgroundColor: CREAM,
    paddingInline: 22,
    paddingBlock: 10,
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
    backgroundColor: "#F4C58F",
    border: "none",
    paddingBlock: 14,
    fontSize: 16,
    fontWeight: 600,
    color: "#3565AF",
    cursor: "pointer",
    marginTop: 10,
  };

  const linkStyle: React.CSSProperties = {
    marginTop: 12,
    fontSize: 13,
    color: "white",
    textDecoration: "none",
    textAlign: "center",
  };

  const errorStyle: React.CSSProperties = {
    marginTop: 6,
    fontSize: 12,
    color: CREAM,
    textAlign: "center",
  };

  return (
    <div style={screenStyle}>
      <div style={phoneStyle}>
        {/* TOP / LOGO SECTION */}
        <div style={topSectionStyle}>
          {/* Home icon */}
          <button
            type="button"
            style={homeIconButtonStyle}
            onClick={() => navigate("/emotional-balance")}
            aria-label="Back to home page"
          >
            🏠
          </button>

          <div style={logoWrapperStyle}>
            <img src={logo} alt="Mendly logo" style={logoImageStyle} />
          </div>
          <div style={appNameStyle}>Mendly App</div>
          <div style={tornEdgeStyle} />
        </div>

        {/* BOTTOM / LOGIN SECTION */}
        <div style={bottomSectionStyle}>
          <div style={titleStyle}>Login</div>
          <div style={subtitleStyle}>Sign in to continue</div>

          <form
            onSubmit={handleSubmit}
            style={{
              width: "80%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={pillWrapperStyle}>
              <input
                style={inputStyle}
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div style={pillWrapperStyle}>
              <input
                style={inputStyle}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <div style={errorStyle}>{error}</div>}

            <button type="submit" style={buttonPillStyle} disabled={loading}>
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <Link to="/signup" style={linkStyle}>
            Create a new account
          </Link>
          <Link to="/forgot-password" style={linkStyle}>
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
