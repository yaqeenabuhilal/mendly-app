import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api/auth";
import { signupPsychologist } from "../api/auth";
import logo from "../assets/mendly-logo.jpg";

const SignupPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState<number>(0); // 0 = prefer not to say
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"regular" | "psychologist">("regular");

  // psychologist fields
  const [specialty, setSpecialty] = useState("");
  const [workplace, setWorkplace] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [yearsExperience, setYearsExperience] = useState<number | "">("");
  const [licenseNumber, setLicenseNumber] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (role === "regular") {
  await signup({
    username,
    email,
    password,
    age: age === "" ? undefined : Number(age),
    gender,
  });
  } else {
  await signupPsychologist({
    username,
    email,
    password,
    age: age === "" ? undefined : Number(age),
    gender,
    specialty,
    workplace,
    city,
  });
}

      alert("Account created successfully, you can login now.");
      navigate("/login");
    } catch (err: any) {
      console.error("Signup error:", err);

      let message = "Signup failed";
      const detail = err?.response?.data?.detail;

      if (typeof detail === "string") {
        message = detail;
      } else if (Array.isArray(detail)) {
        message = detail
          .map((d: any) => d?.msg || JSON.stringify(d))
          .join(", ");
      } else if (detail && typeof detail === "object") {
        message = JSON.stringify(detail);
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ====== SHARED COLORS (same as Login) ======
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
    overflowY: "auto",
    position: "relative",
  };

  const topSectionStyle: React.CSSProperties = {
    backgroundColor: CREAM,
    paddingTop: 24,
    paddingBottom: 20,
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

  // LOGO as background image in a circle
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
    paddingTop: 24,
    paddingBottom: 24,
    paddingInline: 24,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: "white",
    backgroundColor: BLUE,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 24,
    fontWeight: 800,
    marginBottom: 2,
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: 14,
    opacity: 0.95,
    marginBottom: 20,
  };

  const pillWrapperStyle: React.CSSProperties = {
    width: "100%",
    marginBottom: 10,
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

  const linkStyle: React.CSSProperties = {
    marginTop: 14,
    fontSize: 13,
    color: "white",
    textDecoration: "none",
    textAlign: "center",
  };

  const SPECIALTIES = [
  "Clinical Psychology",
  "CBT (Cognitive Behavioral Therapy)",
  "DBT (Dialectical Behavior Therapy)",
  "Trauma / PTSD",
  "Child & Adolescent Psychology",
  "Family & Couples Therapy",
  "Anxiety Disorders",
  "Mood Disorders",
  "Addiction",
  "Neuropsychology",
  "Health Psychology",
  "Other",
];


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

          <div style={logoCircleStyle} />
          <div style={appNameStyle}>Mendly App</div>
          <div style={tornEdgeStyle} />
        </div>

        {/* BOTTOM / SIGNUP SECTION */}
        <div style={bottomSectionStyle}>
          <div style={titleStyle}>Create New Account</div>
          <div style={subtitleStyle}>join to our family</div>

          <form
            onSubmit={handleSubmit}
            style={{
              width: "80%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Account type */}
              <div style={pillWrapperStyle}>
                <select
                  style={selectStyle}
                  value={role}
                  onChange={(e) => setRole(e.target.value as "regular" | "psychologist")}
                >
                  <option value="regular">Regular user</option>
                  <option value="psychologist">Psychologist</option>
                </select>
                <span style={caretStyle}>▼</span>
              </div>

            {/* Username */}
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

            {/* Email */}
            <div style={pillWrapperStyle}>
              <input
                style={inputStyle}
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
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
                  setAge(e.target.value === "" ? "" : Number(e.target.value))
                }
              />
            </div>

            {/* Gender */}
            <div style={pillWrapperStyle}>
              <select
                style={selectStyle}
                value={gender}
                onChange={(e) => setGender(Number(e.target.value))}
              >
                <option value={0}>Gender</option>
                <option value={1}>Female</option>
                <option value={2}>Male</option>
                <option value={3}>Other</option>
              </select>
              <span style={caretStyle}>▼</span>
            </div>
            {role === "psychologist" && (
            <>
            <div style={pillWrapperStyle}>
              <select
                style={inputStyle}
                value={specialty ?? ""}
                onChange={(e) => setSpecialty(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select specialty
                </option>

                {SPECIALTIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>


            <div style={pillWrapperStyle}>
              <input
                style={inputStyle}
                type="text"
                placeholder="Workplace"
                value={workplace}
                onChange={(e) => setWorkplace(e.target.value)}
              />
            </div>

              <div style={pillWrapperStyle}>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </>
          )}


            {error && <div style={errorStyle}>{error}</div>}

            <button type="submit" style={buttonPillStyle} disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <Link to="/login" style={linkStyle}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
