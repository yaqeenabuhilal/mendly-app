// react-app/src/pages/DiaphragmaticBreathingPage.tsx
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/mendly-logo.jpg";

const DiaphragmaticBreathingPage: React.FC = () => {
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
      // button is visible if it overlaps the visible scroll area
      buttonVisible =
        btnRect.top < contentRect.bottom && btnRect.bottom > contentRect.top;
    }

    // show arrow only if user is not at the top AND button is NOT visible
    setShowScrollTop(scrolled > 20 && !buttonVisible);
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
    fontSize: 22,
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

  // scroll-to-top button
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

  const handleVideoClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.preventDefault();
    window.open(
      "https://www.youtube.com/watch?v=9jpchJcKivk",
      "_blank",
      "noopener,noreferrer"
    );
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
            <span style={headerTitleStyle}>Diaphragmatic Breathing</span>
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

          {/* Section: What it is */}
          <div>
            <div style={sectionTitleStyle}>
              Diaphragmatic (Belly) Breathing
            </div>
          </div>
          <div style={textCardStyle}>
            <p style={{ marginTop: 0 }}>
              Diaphragmatic breathing helps you shift from shallow chest
              breathing to deep abdominal breathing, improving oxygen flow and
              reducing muscle tension. It’s widely used in therapies like CBT
              to support stress regulation, emotional balance, and focus.
            </p>
            <p>
              Instead of lifting your shoulders and breathing high in the chest,
              this technique teaches your body to breathe using the diaphragm —
              a strong muscle under your lungs — so each breath is slower,
              deeper, and more efficient.
            </p>
          </div>

          {/* Section: How to do it */}
          <div>
            <div style={sectionTitleStyle}>How to do it</div>
          </div>
          <div style={textCardStyle}>
            <p style={{ marginTop: 0, fontWeight: 600 }}>
              Follow these steps slowly:
            </p>
            <ul style={tipsListStyle}>
              <li>Sit or lie down comfortably.</li>
              <li>Place one hand on your chest and the other on your stomach.</li>
              <li>
                Inhale slowly through your nose, letting your stomach rise (your
                chest should stay relatively still).
              </li>
              <li>
                Exhale gently through your mouth as your stomach falls, like
                letting air out of a balloon.
              </li>
              <li>Continue for about 1–2 minutes at a calm, steady pace.</li>
            </ul>
            <p>
              You can count to 4 on the inhale and 4–6 on the exhale if it helps
              you keep a slow rhythm.
            </p>
          </div>

          {/* Section: Tips & CBT-style use */}
          <div>
            <div style={sectionTitleStyle}>Tips for better practice</div>
          </div>
          <div style={textCardStyle}>
            <p style={{ marginTop: 0 }}>
              Small details can make diaphragmatic breathing much more
              effective:
            </p>
            <ul style={tipsListStyle}>
              <li>
                Focus on the hand over your stomach moving more than the hand on
                your chest.
              </li>
              <li>
                Relax your shoulders and jaw — tension here can keep breathing
                stuck in the chest.
              </li>
              <li>
                Use calm background sounds or soft music if it helps you stay
                focused.
              </li>
              <li>
                Aim for 3–5 short sessions a day (1–2 minutes each) instead of
                one long session.
              </li>
              <li>
                Pair it with a thought like:{" "}
                <em>&quot;I’m safe right now; I’m just breathing.&quot;</em> to
                support CBT-style calming.
              </li>
            </ul>
          </div>

          {/* Section: When to use it */}
          <div>
            <div style={sectionTitleStyle}>When can it help?</div>
          </div>
          <div style={textCardStyle}>
            <p style={{ marginTop: 0 }}>
              You can use belly breathing whenever you want to gently calm your
              system:
            </p>
            <ul style={tipsListStyle}>
              <li>Before an exam, game, or stressful conversation.</li>
              <li>When you notice racing thoughts or tight chest/shoulders.</li>
              <li>As a mini-reset between study blocks or training sessions.</li>
              <li>As part of your night routine to wind down before sleep.</li>
            </ul>
            <p>
              The more often you practice when you’re already calm, the easier
              it becomes to use it when you’re stressed.
            </p>
          </div>

          {/* YouTube video */}
          <div style={videoCardStyle}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              Watch a guided diaphragmatic breathing video
            </div>
            <a
              href="https://www.youtube.com/watch?v=9jpchJcKivk"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
              onClick={handleVideoClick}
            >
              <div style={videoThumbStyle}>
                <div style={playCircleStyle}>▶</div>
                <div style={videoTitleStyle}>
                  Diaphragmatic (Belly) Breathing – Guided practice
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
                Sit comfortably, place one hand on your chest and one on your
                belly. Try 8–10 slow breaths:
              </div>
              <ul style={{ ...tipsListStyle, textAlign: "left" }}>
                <li>Inhale through your nose for a count of 4.</li>
                <li>Feel your belly expand under your hand.</li>
                <li>Exhale gently through your mouth for a count of 6.</li>
                <li>Keep shoulders relaxed and chest as still as possible.</li>
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

export default DiaphragmaticBreathingPage;
