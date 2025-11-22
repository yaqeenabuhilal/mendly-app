// react-app/src/pages/PositiveNotificationsPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/mendly-logo.jpg";
import happyMindImg from "../assets/happy-mind.jpg";
import {
  getPositiveNotificationSettings,
  updatePositiveNotificationSettings,
} from "../api/auth";

// 🔹 API base for calling backend directly
const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://localhost:8000";

// 🔹 Test messages for the "Send test" button
const TEST_POSITIVE_MESSAGES: string[] = [
  "Take one slow deep breath. You’re doing better than you think 🌱",
  "Mini reset: roll your shoulders, unclench your jaw, sip some water 💧",
  "You’ve already handled so much. One small step is enough for now 💛",
  "Reminder: you are not alone. Reaching out is a strength, not a weakness 🤝",
  "Pause for 10 seconds and notice 3 things you can see around you 👀",
  "Your feelings matter. Treat yourself today like you would a close friend 💬",
  "Small progress still counts. What’s one tiny win you can do next? ✅",
  "You deserve rest, not just productivity. Take a gentle break when you can 💤",
  "Notice one thing you appreciate about yourself right now ✨",
  "You’re allowed to start again, as many times as you need 🌈",
];

function getRandomPositiveMessage(): string {
  if (!TEST_POSITIVE_MESSAGES.length) {
    return "You’re doing better than you think 🌱";
  }
  const idx = Math.floor(Math.random() * TEST_POSITIVE_MESSAGES.length);
  return TEST_POSITIVE_MESSAGES[idx];
}

const PositiveNotificationsPage: React.FC = () => {
  const navigate = useNavigate();

  const BLUE = "#6BA7E6";
  const CREAM = "#f5e9d9";
  const GREEN = "#10B981";

  // ===== STATE =====
  const [enabled, setEnabled] = useState<boolean>(true);
  const [frequency, setFrequency] = useState<string>("60");
  const [loadingSettings, setLoadingSettings] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // 🔁 Load settings from backend when page mounts
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const data = await getPositiveNotificationSettings();
        if (!isMounted) return;

        setEnabled(data.enabled);
        setFrequency(String(data.frequency_minutes));
      } catch (e: any) {
        console.error("Failed to load positive notification settings:", e);
        if (isMounted) {
          setStatusMsg(
            e?.message || "Could not load your settings, using defaults."
          );
        }
      } finally {
        if (isMounted) setLoadingSettings(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // we keep this empty – backend-driven push now
  useEffect(() => {
    if (loadingSettings) return;
  }, [enabled, frequency, loadingSettings]);

  // ===== HANDLERS =====
  const handleUpdateClick = async () => {
    setSaving(true);
    setStatusMsg(null);
    try {
      const minutes = parseInt(frequency, 10);
      const payload = {
        enabled,
        frequency_minutes: isNaN(minutes) ? 60 : minutes,
      };

      await updatePositiveNotificationSettings(payload);
      setStatusMsg("Settings updated ✅");
    } catch (e: any) {
      console.error("Failed to update positive notifications:", e);
      setStatusMsg(e?.message || "Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  // 🔹 NEW: ask backend to enqueue a test positive notification (FCM push)
  const handleSendTestClick = async () => {
    try {
      const token = window.localStorage.getItem("access_token");
      if (!token) {
        alert("You must be logged in to send a test notification.");
        return;
      }

      const body = getRandomPositiveMessage();

      const res = await fetch(
        `${API_BASE}/positive-notifications/send-test`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ body }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("send-test failed:", res.status, text);
        setStatusMsg("Failed to enqueue test notification.");
      } else {
        setStatusMsg("Test notification enqueued ✅ Check your device.");
      }
    } catch (err) {
      console.error("Error sending test notification:", err);
      setStatusMsg("Error sending test notification.");
    }
  };

  // ===== STYLES (same base as Journey) =====
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
    height: "50px",
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
    gap: 4,
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
    fontSize: 24,
    color: "#5F8DD0",
  };

  const bottomSectionStyle: React.CSSProperties = {
    flex: 1,
    padding: "0 0 16px 0",
    backgroundColor: BLUE,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: "white",
    gap: 16,
    overflowY: "auto",
    overflowX: "hidden",
  };

  const innerContentStyle: React.CSSProperties = {
    width: "100%",
    padding: "0 22px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: 3,
  };

  const cardStyle: React.CSSProperties = {
    width: "100%",
    backgroundColor: CREAM,
    borderRadius: 24,
    padding: "18px 18px 20px 18px",
    color: "#374151",
    boxShadow: "0 10px 25px rgba(15,23,42,0.18)",
    boxSizing: "border-box",
  };

  const headerImagePlaceholder: React.CSSProperties = {
    width: "100%",
    height: 200,
    borderRadius: 0,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const labelStyle: React.CSSProperties = {
    fontWeight: 600,
    fontSize: 14,
    marginBottom: 8,
  };

  const selectStyle: React.CSSProperties = {
    width: "100%",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    padding: "8px 10px",
    fontSize: 14,
    outline: "none",
  };

  const toggleRowStyle: React.CSSProperties = {
    marginTop: 22,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  };

  const toggleLabelStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 500,
  };

  const toggleTrackStyle = (isOn: boolean): React.CSSProperties => ({
    width: 50,
    height: 28,
    borderRadius: 999,
    backgroundColor: isOn ? GREEN : "#d1d5db",
    display: "flex",
    alignItems: "center",
    padding: 3,
    boxSizing: "border-box",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  });

  const toggleThumbStyle = (isOn: boolean): React.CSSProperties => ({
    width: 22,
    height: 22,
    borderRadius: "50%",
    backgroundColor: "white",
    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
    transform: isOn ? "translateX(18px)" : "translateX(0)",
    transition: "transform 0.2s ease",
  });

  const helperTextStyle: React.CSSProperties = {
    marginTop: 10,
    fontSize: 12,
    color: "#6b7280",
  };

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

  const updateButtonStyle: React.CSSProperties = {
    marginTop: 16,
    width: "100%",
    borderRadius: 999,
    backgroundColor: "#F4C58F",
    border: "none",
    paddingBlock: 10,
    fontSize: 15,
    fontWeight: 600,
    color: "#3565AF",
    cursor: saving ? "wait" : "pointer",
  };

  const testButtonStyle: React.CSSProperties = {
    marginTop: 8,
    width: "100%",
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    border: "none",
    paddingBlock: 10,
    fontSize: 14,
    fontWeight: 500,
    color: "#111827",
    cursor: "pointer",
  };

  const statusMsgStyle: React.CSSProperties = {
    marginTop: 8,
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  };

  const describeFrequency = (value: string): string => {
    switch (value) {
      case "15":
        return "every 15 minutes";
      case "30":
        return "every 30 minutes";
      case "60":
        return "every hour";
      case "120":
        return "every 2 hours";
      case "240":
        return "every 4 hours";
      case "1440":
        return "once a day";
      default:
        return "regularly";
    }
  };

  if (loadingSettings) {
    return (
      <div style={screenStyle}>
        <div style={phoneStyle}>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            Loading your settings…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={screenStyle}>
      <div style={phoneStyle}>
        {/* HEADER */}
        <div style={topSectionStyle}>
          <button
            type="button"
            style={homeBtnStyle}
            onClick={() => navigate("/journey")}
            aria-label="Home"
            title="Home"
          >
            🏠
          </button>

          <div style={titleBlockStyle}>
            <div style={smallLabelStyle}>
              <span style={tinyLogoStyle}>
                <img src={logo} alt="Mendly logo" style={tinyLogoImgStyle} />
              </span>
              Mendly App
            </div>
            <span style={headerTitleStyle}>Positive Notifications</span>
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
        <div style={bottomSectionStyle}>
          <div style={headerImagePlaceholder}>
            <img
              src={happyMindImg}
              alt="Keep your mind a happy place"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>

          <div style={innerContentStyle}>
            <div style={cardStyle}>
              <div>
                <div style={labelStyle}>
                  How often do you want to receive positive notifications?
                </div>
                <select
                  style={selectStyle}
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                >
                  <option value="15">Every 15 minutes</option>
                  <option value="30">Every 30 minutes</option>
                  <option value="60">Every hour</option>
                  <option value="120">Every 2 hours</option>
                  <option value="240">Every 4 hours</option>
                  <option value="1440">Once a day</option>
                </select>
              </div>

              <div style={toggleRowStyle}>
                <div style={toggleLabelStyle}>
                  Positive notifications {enabled ? "ON" : "OFF"}
                </div>
                <div
                  style={toggleTrackStyle(enabled)}
                  onClick={() => setEnabled((prev) => !prev)}
                  aria-label="Toggle positive notifications"
                  role="switch"
                  aria-checked={enabled}
                >
                  <div style={toggleThumbStyle(enabled)} />
                </div>
              </div>

              <div style={helperTextStyle}>
                {enabled
                  ? `You will receive positive notifications ${describeFrequency(
                      frequency
                    )}.`
                  : "Positive notifications are turned off. Turn them on to start receiving them again."}
              </div>

              {/* UPDATE BUTTON */}
              <button
                type="button"
                style={updateButtonStyle}
                onClick={handleUpdateClick}
                disabled={saving}
              >
                {saving ? "Updating…" : "Update"}
              </button>

              {/* 🔹 TEST BUTTON → sends FCM push via backend */}
              <button
                type="button"
                style={testButtonStyle}
                onClick={handleSendTestClick}
              >
                Send test positive notification
              </button>

              {statusMsg && <div style={statusMsgStyle}>{statusMsg}</div>}
            </div>
          </div>
        </div>

        {/* BOTTOM NAV */}
        <div style={bottomNavStyle}>
          <div
            style={navItemStyle}
            onClick={() => navigate("/profile")}
            role="button"
            aria-label="Profile"
          >
            <div style={{ fontSize: 22 }}>👤</div>
            <div>Profile</div>
          </div>

          <div
            style={navItemStyle}
            onClick={() => navigate("/chat")}
            role="button"
            aria-label="AI Chat"
          >
            <div style={{ fontSize: 22 }}>💬</div>
            <div>Ai Chat</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositiveNotificationsPage;
