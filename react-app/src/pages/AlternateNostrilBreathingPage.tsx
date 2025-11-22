// react-app/src/pages/AlternateNostrilBreathingPage.tsx
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/mendly-logo.jpg";

const AlternateNostrilBreathingPage: React.FC = () => {
  const navigate = useNavigate();

  const BLUE = "#6BA7E6";
  const CREAM = "#f5e9d9";
  const PURPLE = "#5B5FEF";

  // scroll-to-practice + scroll-to-top
  const practiceRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const practiceButtonRef = useRef<HTMLButtonElement | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleScrollToPractice = () => {
    practiceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleScrollTop = () => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleContentScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrolled = target.scrollTop;

    let buttonVisible = false;
    if (practiceButtonRef.current && contentRef.current) {
      const btnRect = practiceButtonRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();
      buttonVisible =
        btnRect.top < contentRect.bottom && btnRect.bottom > contentRect.top;
    }

    setShowScrollTop(scrolled > 20 && !buttonVisible);
  };

  const handleVideoClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.preventDefault();
    window.open(
      "https://youtu.be/a7re4bKxB3A?si=swnqumEGNeE_7Cl9",
      "_blank",
      "noopener,noreferrer"
    );
  };

  // ===== STYLES =====
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
    borderRadius: 0,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    position: "relative",
  };

  const topSectionStyle: React.CSSProperties = {
    backgroundColor: CREAM,
    paddingTop: 20,
    paddingBottom: 16,
    paddingInline: 16,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    height: 50,
  };

  const iconBtn: React.CSSProperties = {
    position: "absolute",
    top: 14,
    width: 42,
    height: 42,
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    backgroundColor: "#3970aaff",
    color: CREAM,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
  };

  const homeBtnStyle: React.CSSProperties = { ...iconBtn, left: 12 };
  const logoutBtnStyle: React.CSSProperties = { ...iconBtn, right: 12 };

  const titleBlockStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    alignItems: "center",
  };

  const smallLabelStyle: React.CSSProperties = {
    color: "#5F8DD0",
    fontSize: 14,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 6,
  };

  const tinyLogoStyle: React.CSSProperties = {
    width: 28,
    height: 28,
    borderRadius: "50%",
    overflow: "hidden",
    backgroundColor: CREAM,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const tinyLogoImgStyle: React.CSSProperties = {
    width: "130%",
    height: "130%",
    objectFit: "cover",
  };

  const headerTitleStyle: React.CSSProperties = {
    fontFamily: '"Times New Roman", Georgia, serif',
    fontSize: 20,
    color: "#5F8DD0",
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    backgroundColor: BLUE,
    padding: "10px 20px 16px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
    color: "#111827",
    overflowY: "auto",
  };

  // arrow just under the nav to jump to practice
  const scrollArrowWrapperStyle: React.CSSProperties = {
    top: 0,
    zIndex: 10,
    display: "flex",
    justifyContent: "center",
    paddingTop: 4,
    paddingBottom: 4,
    backgroundColor: BLUE,
  };

  const scrollArrowButtonStyle: React.CSSProperties = {
    width: "100%",
    height: 30,
    borderRadius: "40%",
    border: "none",
    backgroundColor: "#F4C58F",
    color: "#3565AF",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(15,23,42,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
  };

  // scroll-to-top button (upper arrow)
  const scrollTopBtnStyle: React.CSSProperties = {
    position: "absolute",
    right: 20,
    bottom: 70,
    width: 40,
    height: 40,
    borderRadius: 999,
    border: "none",
    backgroundColor: "#3970aaff",
    color: CREAM,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    zIndex: 10,
  };

  const sectionTitleStyle: React.CSSProperties = {
    marginTop: 8,
    fontSize: 18,
    fontWeight: 700,
    color: "#f9fafb",
  };

  const textCardStyle: React.CSSProperties = {
    backgroundColor: CREAM,
    borderRadius: 20,
    padding: "14px 14px 16px 14px",
    boxShadow: "0 8px 20px rgba(15,23,42,0.18)",
    fontSize: 14,
    lineHeight: 1.5,
    color: "#111827",
  };

  const tipsListStyle: React.CSSProperties = {
    paddingLeft: 18,
    marginTop: 8,
    marginBottom: 4,
  };

  const videoCardStyle: React.CSSProperties = {
    ...textCardStyle,
    padding: "12px 12px 14px 12px",
  };

  const videoThumbStyle: React.CSSProperties = {
    marginTop: 8,
    borderRadius: 16,
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #111827, #1f2937 40%, #2563eb 70%, #60a5fa)",
    height: 160,
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
  };

  const playCircleStyle: React.CSSProperties = {
    width: 60,
    height: 60,
    borderRadius: "50%",
    border: "3px solid white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
    boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
  };

  const videoTitleStyle: React.CSSProperties = {
    position: "absolute",
    bottom: 10,
    left: 16,
    right: 16,
    fontSize: 14,
    fontWeight: 600,
    textShadow: "0 2px 6px rgba(0,0,0,0.6)",
  };

  // practice card
  const practiceCardStyle: React.CSSProperties = {
    ...textCardStyle,
    textAlign: "center",
  };

  const practiceButtonStyle: React.CSSProperties = {
    marginTop: 10,
    width: "100%",
    borderRadius: 999,
    border: "none",
    padding: "10px 14px",
    backgroundColor: PURPLE,
    color: "#f9fafb",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  };

  // bottom nav
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
    height: 50,
  };

  const navItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
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
        {/* HEADER */}
        <div style={topSectionStyle}>
          <button
            type="button"
            style={homeBtnStyle}
            onClick={() => navigate("/breath")}
            aria-label="Back"
            title="Back"
          >
            ⬅
          </button>

          <div style={titleBlockStyle}>
            <div style={smallLabelStyle}>
              <span style={tinyLogoStyle}>
                <img src={logo} alt="Mendly logo" style={tinyLogoImgStyle} />
              </span>
              Mendly App
            </div>
            <span style={headerTitleStyle}>
              Alternate Nostril Breathing
            </span>
          </div>

          <button
            type="button"
            style={logoutBtnStyle}
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("access_token");
              navigate("/login", { replace: true });
            }}
            aria-label="Logout"
            title="Log out"
          >
            🚪
          </button>
        </div>

        {/* CONTENT */}
        <div
          style={contentStyle}
          ref={contentRef}
          onScroll={handleContentScroll}
        >
          {/* jump-to-practice arrow */}
          <div style={scrollArrowWrapperStyle}>
            <button
              type="button"
              style={scrollArrowButtonStyle}
              onClick={handleScrollToPractice}
              aria-label="Scroll to practice section"
              title="Go to practice"
            >
              ⬇ Go to practice section ⬇
            </button>
          </div>

          {/* Purpose & Benefits */}
          <div>
            <div style={sectionTitleStyle}>Purpose &amp; benefits</div>
          </div>
          <div style={textCardStyle}>
            <p style={{ marginTop: 0 }}>
              Alternate Nostril Breathing (Nadi Shodhana) is a classic
              yoga-based technique. It’s often used to balance activity between
              the left and right sides of the brain, helping reduce emotional
              swings and anxiety.
            </p>
            <p>
              Many people use it when they want to feel more{" "}
              <strong>centered</strong>, clear, and steady. It can be a powerful
              reset for your nervous system when you feel scattered or
              overloaded.
            </p>
          </div>

          {/* How to do it */}
          <div>
            <div style={sectionTitleStyle}>How to do it</div>
          </div>
          <div style={textCardStyle}>
            <p style={{ marginTop: 0, fontWeight: 600 }}>
              Sit upright and use your right hand:
            </p>
            <ul style={tipsListStyle}>
              <li>Sit comfortably with your spine tall and shoulders relaxed.</li>
              <li>
                Use your right hand: thumb will close the{" "}
                <strong>right</strong> nostril, ring finger the{" "}
                <strong>left</strong> nostril.
              </li>
              <li>
                Gently close your right nostril with your thumb and{" "}
                <strong>inhale through the left</strong>.
              </li>
              <li>Close both nostrils briefly.</li>
              <li>
                Open the right nostril and <strong>exhale through the right</strong>.
              </li>
              <li>
                Now inhale through the <strong>right</strong>, close both, then{" "}
                <strong>exhale through the left</strong>.
              </li>
            </ul>
            <p>
              Continue alternating left → right → left for about 1–2 minutes at
              a slow, comfortable pace.
            </p>
          </div>

          {/* Tips & safety */}
          <div>
            <div style={sectionTitleStyle}>Tips &amp; safety</div>
          </div>
          <div style={textCardStyle}>
            <p style={{ marginTop: 0 }}>
              A few simple guidelines make this practice safer and more
              effective:
            </p>
            <ul style={tipsListStyle}>
              <li>Always start and end with the <strong>left nostril</strong>.</li>
              <li>
                Avoid this practice if you’re very congested, have a sinus
                infection, or feel unwell.
              </li>
              <li>
                Keep the breath smooth and natural, not forced—no need to drag
                in huge breaths.
              </li>
              <li>
                Keep your face, jaw, and shoulders relaxed while only the
                fingers move.
              </li>
              <li>
                If you feel dizzy or uncomfortable, stop, breathe normally, and
                try again another time.
              </li>
            </ul>
          </div>

          {/* When can it help? */}
          <div>
            <div style={sectionTitleStyle}>When can it help?</div>
          </div>
          <div style={textCardStyle}>
            <p style={{ marginTop: 0 }}>
              Nadi Shodhana is especially helpful when you feel emotionally
              off-balance or mentally overloaded:
            </p>
            <ul style={tipsListStyle}>
              <li>
                Before a performance, exam, or game when you feel both anxious
                and tired.
              </li>
              <li>
                After an argument or stressful interaction, to reset your mood.
              </li>
              <li>
                As part of an evening wind-down to clear the day before sleep.
              </li>
              <li>
                Any time you feel disconnected from yourself and want to feel
                more centered.
              </li>
            </ul>
          </div>

          {/* Video */}
          <div style={videoCardStyle}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              Watch a guided alternate nostril breathing video
            </div>
            <a
              href="https://youtu.be/a7re4bKxB3A?si=swnqumEGNeE_7Cl9"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
              onClick={handleVideoClick}
            >
              <div style={videoThumbStyle}>
                <div style={playCircleStyle}>▶</div>
                <div style={videoTitleStyle}>
                  Alternate Nostril Breathing – Guided practice
                </div>
              </div>
            </a>
          </div>

          {/* Practice section */}
          <div ref={practiceRef}>
            <div style={practiceCardStyle}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                Try it now (1–2 minutes)
              </div>
              <div style={{ fontSize: 13, color: "#4b5563" }}>
                Sit upright, relax your shoulders, and follow a few gentle
                rounds:
              </div>
              <ul style={{ ...tipsListStyle, textAlign: "left" }}>
                <li>
                  Close your right nostril and inhale slowly through the left.
                </li>
                <li>Close both briefly, feeling the pause.</li>
                <li>Exhale through the right nostril.</li>
                <li>
                  Inhale through the right, close both, and exhale through the
                  left.
                </li>
                <li>
                  Repeat this left ↔ right pattern for 6–10 smooth rounds, then
                  rest and breathe normally.
                </li>
              </ul>
              <button
                type="button"
                style={practiceButtonStyle}
                onClick={handleScrollTop}
                ref={practiceButtonRef}
              >
                Finished a round? Back to top ↑
              </button>
            </div>
          </div>
        </div>

        {/* SCROLL TO TOP BUTTON */}
        {showScrollTop && (
          <button
            type="button"
            style={scrollTopBtnStyle}
            onClick={handleScrollTop}
            aria-label="Back to top"
            title="Back to top"
          >
            ↑
          </button>
        )}

        {/* BOTTOM NAV */}
        <div style={bottomNavStyle}>
          <button
            type="button"
            style={navItemStyle}
            onClick={() => navigate("/profile")}
            aria-label="Profile"
          >
            <div style={{ fontSize: 22 }}>👤</div>
            <div>Profile</div>
          </button>

          <button
            type="button"
            style={navItemStyle}
            onClick={() => navigate("/journey")}
            aria-label="Home"
            title="Home"
          >
            <div style={{ fontSize: 22 }}>🏠</div>
          </button>

          <button
            type="button"
            style={navItemStyle}
            onClick={() => navigate("/chat")}
            aria-label="AI Chat"
          >
            <div style={{ fontSize: 22 }}>💬</div>
            <div>Ai Chat</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlternateNostrilBreathingPage;
