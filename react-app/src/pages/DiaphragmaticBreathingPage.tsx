// react-app/src/pages/DiaphragmaticBreathingPage.tsx
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/mendly-logo.jpg";
import bellyImg from "../assets/belly.png";

const DiaphragmaticBreathingPage: React.FC = () => {
  const navigate = useNavigate();

  const BLUE = "#6BA7E6";
  const CREAM = "#f5e9d9";
  const PURPLE = "#5B5FEF";

  // refs + state
  const practiceRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  const handleScrollToPractice = () => {
    practiceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleScrollTop = () => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  // open YouTube INSIDE app (modal)
  const handleVideoClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.preventDefault();
    setShowVideoModal(true);
  };

  // ===== STYLES (copied from Breathing874Page style language) =====
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

  // same small top bar as Breathing874Page
  const topSectionStyle: React.CSSProperties = {
    backgroundColor: CREAM,
    paddingTop: 6,
    paddingBottom: 6,
    paddingInline: 16,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  };

  const iconBtn: React.CSSProperties = {
    position: "absolute",
    top: 8,
    width: 35,
    height: 35,
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    backgroundColor: "#3970aa",
    color: CREAM,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
  };

  const homeBtnStyle: React.CSSProperties = { ...iconBtn, left: 16 };
  const logoutBtnStyle: React.CSSProperties = { ...iconBtn, right: 16 };

  const logoBlockStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  };

  const logoCircleStyle: React.CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: "50%",
    overflow: "hidden",
    backgroundColor: CREAM,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
  };

  const logoImgStyle: React.CSSProperties = {
    width: "130%",
    height: "130%",
    objectFit: "cover",
  };

  const appNameStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: "#5F8DD0",
    letterSpacing: 0.5,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    backgroundColor: BLUE,
    padding: "18px 24px 16px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    color: "#f9fafb",
    overflowY: "auto",
  };

  const heroTitleStyle: React.CSSProperties = {
    fontSize: 26,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 6,
  };

  // hero image (belly.png)
  const heroImageWrapperStyle: React.CSSProperties = {
      marginTop: 4,
      marginBottom: 10,
      display: "flex",
      justifyContent: "center",
      backgroundColor: BLUE,      // same as page
      borderRadius: 0,
      overflow: "hidden",
    };
  
    const heroImageStyle: React.CSSProperties = {
      width: "100%",
      height: 150,
      maxWidth: 580,
      display: "block",
      mixBlendMode: "multiply",   // white turns into background color
    };

  const dividerStyle: React.CSSProperties = {
    textAlign: "center",
    letterSpacing: 4,
    margin: "12px 0 4px 0",
  };

  const scrollArrowWrapperStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    marginTop: 4,
    marginBottom: 4,
  };

  const scrollArrowButtonStyle: React.CSSProperties = {
    borderRadius: 999,
    border: "none",
    backgroundColor: "#F4C58F",
    color: "#3565AF",
    cursor: "pointer",
    padding: "6px 14px",
    boxShadow: "0 4px 12px rgba(15,23,42,0.35)",
    fontSize: 14,
    fontWeight: 600,
  };

  const scrollTopBtnStyle: React.CSSProperties = {
    position: "absolute",
    right: 20,
    bottom: 70,
    width: 40,
    height: 40,
    borderRadius: 999,
    border: "none",
    backgroundColor: "#3970aa",
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
    fontSize: 20,
    fontWeight: 700,
    color: "#ffffff",
  };

  const textBlockStyle: React.CSSProperties = {
    fontSize: 14,
    lineHeight: 1.6,
    color: "#f9fafb",
  };

  const tipsListStyle: React.CSSProperties = {
    paddingLeft: 18,
    marginTop: 8,
    marginBottom: 4,
  };

  const videoCardStyle: React.CSSProperties = {
    ...textBlockStyle,
  };

  const videoThumbStyle: React.CSSProperties = {
    marginTop: 8,
    borderRadius: 24,
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

  const videoFrameWrapperStyle: React.CSSProperties = {
    width: "100%",
    aspectRatio: "16 / 9",
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 8,
  };

  const videoIframeStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    border: "none",
  };

  // practice section
  const practiceSectionStyle: React.CSSProperties = {
    ...textBlockStyle,
    textAlign: "center",
    backgroundColor: "rgba(249, 250, 251, 0.08)",
    borderRadius: 16,
    padding: "14px 12px",
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

  // modal (reuse from 4-7-8 page)
  const modalOverlayStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(15,23,42,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 30,
  };

  const modalCardStyle: React.CSSProperties = {
    backgroundColor: CREAM,
    borderRadius: 24,
    padding: "16px 16px 18px 16px",
    width: "100%",
    maxWidth: 360,
    boxShadow: "0 10px 30px rgba(15,23,42,0.4)",
    textAlign: "center",
    position: "relative",
  };

  const modalCloseBtnStyle: React.CSSProperties = {
    position: "absolute",
    top: 10,
    right: 10,
    border: "none",
    borderRadius: "999px",
    width: 30,
    height: 30,
    cursor: "pointer",
    backgroundColor: "#e5e7eb",
    color: "#111827",
    fontWeight: 700,
  };

  return (
    <div style={screenStyle}>
      <div style={phoneStyle}>
        {/* HEADER (same as 4-7-8) */}
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

          <div style={logoBlockStyle}>
            <div style={logoCircleStyle}>
              <img src={logo} alt="Mendly logo" style={logoImgStyle} />
            </div>
            <div style={appNameStyle}>
              <strong>Mendly App</strong>
            </div>
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
          onScroll={(e) => setShowScrollTop(e.currentTarget.scrollTop > 60)}
        >
          {/* Hero title + belly image */}
          <div>
            <div style={heroTitleStyle}>Diaphragmatic Breathing</div>
            <div style={heroImageWrapperStyle}>
              <img
                src={bellyImg}
                alt="Illustration of belly breathing"
                style={heroImageStyle}
              />
            </div>
          </div>

          {/* Scroll arrow to practice section */}
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

          <div style={dividerStyle}>••••••••••••••••••••••••</div>

          {/* Sections – copied text but styled like 4-7-8 page */}
          <div>
            <div style={sectionTitleStyle}>What is diaphragmatic breathing?</div>
          </div>
          <div style={textBlockStyle}>
            <p style={{ marginTop: 4 }}>
              Diaphragmatic breathing helps you shift from shallow chest breathing
              to deep abdominal breathing, improving oxygen flow and reducing
              muscle tension. It’s widely used in therapies like CBT to support
              stress regulation, emotional balance, and focus.
            </p>
            <p>
              Instead of lifting your shoulders and breathing high in the chest,
              this technique teaches your body to breathe using the diaphragm—a
              strong muscle under your lungs—so each breath is slower, deeper, and
              more efficient.
            </p>
          </div>

          <div>
            <div style={sectionTitleStyle}>How to do it</div>
          </div>
          <div style={textBlockStyle}>
            <p style={{ marginTop: 4, fontWeight: 600 }}>
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

          <div>
            <div style={sectionTitleStyle}>Tips for better practice</div>
          </div>
          <div style={textBlockStyle}>
            <p style={{ marginTop: 4 }}>
              Small details can make diaphragmatic breathing much more effective:
            </p>
            <ul style={tipsListStyle}>
              <li>
                Focus on the hand over your stomach moving more than the hand on
                your chest.
              </li>
              <li>
                Relax your shoulders and jaw—tension here can keep breathing stuck
                in the chest.
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
                Pair it with a thought like{" "}
                <em>&quot;I’m safe right now; I’m just breathing.&quot;</em> to
                support CBT-style calming.
              </li>
            </ul>
          </div>

          <div>
            <div style={sectionTitleStyle}>When can it help?</div>
          </div>
          <div style={textBlockStyle}>
            <p style={{ marginTop: 4 }}>
              You can use belly breathing whenever you want to gently calm your
              system:
            </p>
            <ul style={tipsListStyle}>
              <li>Before an exam, game, or stressful conversation.</li>
              <li>When you notice racing thoughts or a tight chest/shoulders.</li>
              <li>As a mini-reset between study blocks or training sessions.</li>
              <li>As part of your night routine to wind down before sleep.</li>
            </ul>
            <p>
              The more often you practice when you’re already calm, the easier it
              becomes to use it when you’re stressed.
            </p>
          </div>

          {/* Video card – same style as 4-7-8 page, but with this video */}
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

          <div style={dividerStyle}>••••••••••••••••••••••••</div>

          {/* Practice section (scroll arrow goes here) */}
          <div ref={practiceRef}>
            <div style={practiceSectionStyle}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                Try it now (1–2 minutes)
              </div>
              <div style={{ fontSize: 13, color: "#e5e7eb" }}>
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

        {/* BOTTOM NAV (same as other pages) */}
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

        {/* VIDEO MODAL */}
        {showVideoModal && (
          <div style={modalOverlayStyle}>
            <div style={modalCardStyle}>
              <button
                type="button"
                style={modalCloseBtnStyle}
                onClick={() => setShowVideoModal(false)}
                aria-label="Close"
                title="Close"
              >
                ✕
              </button>
              <h3 style={{ margin: 0, marginBottom: 4, fontSize: 16 }}>
                Diaphragmatic Breathing – Guided video
              </h3>
              <p style={{ marginTop: 0, fontSize: 12, color: "#4b5563" }}>
                Watch and follow along with this short guided practice.
              </p>
              <div style={videoFrameWrapperStyle}>
                <iframe
                  src="https://www.youtube.com/embed/9jpchJcKivk"
                  title="Diaphragmatic (Belly) Breathing – Guided practice"
                  style={videoIframeStyle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiaphragmaticBreathingPage;
