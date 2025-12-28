// react-app/src/pages/PsychologistsDirectoryPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/mendly-logo.jpg";
import thankYouImg from "../assets/thank-you.png";
import { API_BASE } from "../api/auth"; // ✅ uses 10.0.2.2 on native (emulator)

// ================== TYPES ==================
type PsychologistProfile = {
  specialty?: string | null;
  workplace?: string | null;
  city?: string | null;
  bio?: string | null;
  years_experience?: number | null;
  license_number?: string | null;
};

type Psychologist = {
  user_id: string;
  username: string;
  email?: string;
  role?: string;

  psychologist_profile?: PsychologistProfile | null;

  // fallback (flat)
  specialty?: string | null;
  workplace?: string | null;
  city?: string | null;
  bio?: string | null;
  years_experience?: number | null;
  license_number?: string | null;
};

type PsychologistPublic = {
  user_id: string;
  username: string;
  email?: string | null;

  specialty?: string | null;
  workplace?: string | null;
  city?: string | null;
  bio?: string | null;
  years_experience?: number | null;
  license_number?: string | null;
};

type Q = { key: string; label: string; placeholder?: string };

// ================== HELPERS ==================
const safe = (v?: string | null) => (v && v.trim() ? v : "—");

const normalize = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const getProfileFields = (p: Psychologist) => {
  const prof = p.psychologist_profile ?? null;
  const specialty = prof?.specialty ?? p.specialty ?? "";
  const city = prof?.city ?? p.city ?? "";
  const workplace = prof?.workplace ?? p.workplace ?? "";
  const bio = prof?.bio ?? p.bio ?? "";
  const years = prof?.years_experience ?? p.years_experience ?? null;
  return { specialty, city, workplace, bio, years };
};

const initialsFromName = (name: string) => {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (a + b).toUpperCase() || "P";
};

// ================== PAGE ==================
const PsychologistsDirectoryPage: React.FC = () => {
  const navigate = useNavigate();

  const BLUE = "#6BA7E6";
  const CREAM = "#f5e9d9";
  const BTN = "#2a5f97";

  const [items, setItems] = useState<Psychologist[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Search filters locally
  const [q, setQ] = useState("");

  // ================== POPUP STATE ==================
  const [profileOpen, setProfileOpen] = useState(false);
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [chooseOpen, setChooseOpen] = useState(false); // ✅ new: date/time popup
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // profile popup data
  const [profileItem, setProfileItem] = useState<PsychologistPublic | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileErr, setProfileErr] = useState<string | null>(null);

  // intake popup state
  const questions: Q[] = useMemo(
    () => [
      { key: "main_issue", label: "What brings you here today?", placeholder: "Describe briefly…" },
      { key: "goals", label: "What do you want to achieve in therapy?", placeholder: "Your goals…" },
      { key: "sleep", label: "How is your sleep lately?", placeholder: "Good / average / poor…" },
      { key: "stress", label: "Current stress level (0-10)?", placeholder: "0-10" },
      { key: "history", label: "Have you tried therapy before?", placeholder: "Yes/No + details…" },
      { key: "notes", label: "Anything important the psychologist should know?", placeholder: "Optional…" },
    ],
    []
  );

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState("");
  const [intakeSaving, setIntakeSaving] = useState(false);
  const [intakeErr, setIntakeErr] = useState<string | null>(null);

  // ✅ after intake: create appointment request in a popup
  const [intakeId, setIntakeId] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [apptSaving, setApptSaving] = useState(false);
  const [apptErr, setApptErr] = useState<string | null>(null);

  // ✅ thank-you screen like CheckIn
  const [showThanks, setShowThanks] = useState(false);

  // lock background scroll if any popup is open
  useEffect(() => {
    const anyOpen = profileOpen || intakeOpen || chooseOpen;
    const prev = document.body.style.overflow;
    if (anyOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [profileOpen, intakeOpen, chooseOpen]);

  // ================== STYLES ==================
  const screenStyle: React.CSSProperties = {
    height: "100vh",
    width: "100vw",
    margin: 0,
    padding: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "stretch",
    backgroundColor: BLUE,
    fontFamily: '"Poppins", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  };

  const phoneStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    maxWidth: 450,
    backgroundColor: BLUE,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    position: "relative",
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: CREAM,
    padding: "16px 16px 14px",
    boxShadow: "0 6px 18px rgba(15,23,42,0.12)",
    boxSizing: "border-box",
  };

  const headerRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  };

  const iconBtn: React.CSSProperties = {
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
    flex: "0 0 auto",
  };

  const brandRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    justifyContent: "center",
    flex: 1,
    minWidth: 0,
  };

  const tinyLogoStyle: React.CSSProperties = {
    width: 34,
    height: 34,
    borderRadius: "50%",
    overflow: "hidden",
    backgroundColor: CREAM,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 14px rgba(0,0,0,0.08)",
    flex: "0 0 auto",
  };

  const tinyLogoImgStyle: React.CSSProperties = {
    width: "150%",
    height: "150%",
    objectFit: "cover",
  };

  const brandTextWrap: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    lineHeight: 1.05,
    minWidth: 0,
  };

  const brandTitle: React.CSSProperties = {
    color: "#3565AF",
    fontWeight: 800,
    fontSize: 18,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const brandSubtitle: React.CSSProperties = {
    color: "#5F8DD0",
    fontWeight: 650,
    fontSize: 13,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflowY: "auto",
    padding: "14px 16px 16px",
    boxSizing: "border-box",
  };

  const heroCard: React.CSSProperties = {
    backgroundColor: "rgba(245,233,217,0.22)",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: 22,
    padding: 14,
    boxShadow: "0 14px 32px rgba(15,23,42,0.14)",
    marginBottom: 12,
    backdropFilter: "blur(6px)",
  };

  const heroText: React.CSSProperties = {
    margin: "6px 0 0",
    fontSize: 12,
    fontWeight: 650,
    color: "rgba(255,255,255,0.92)",
    lineHeight: 1.35,
  };

  const searchWrap: React.CSSProperties = {
    marginTop: 12,
    display: "flex",
    gap: 10,
    alignItems: "center",
  };

  const searchInputWrap: React.CSSProperties = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 999,
    padding: "12px 14px",
    boxShadow: "0 12px 28px rgba(15,23,42,0.18)",
    border: "1px solid rgba(53,101,175,0.10)",
  };

  const searchIcon: React.CSSProperties = {
    fontSize: 16,
    opacity: 0.8,
  };

  const searchStyle: React.CSSProperties = {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 14,
    fontWeight: 650,
    color: "#111827",
  };

  const clearBtn: React.CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    backgroundColor: "rgba(53,101,175,0.12)",
    color: "#3565AF",
    fontWeight: 800,
    boxShadow: "0 8px 18px rgba(0,0,0,0.10)",
    opacity: q.trim() ? 1 : 0.6,
  };

  const listGap: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  };

  const card: React.CSSProperties = {
    width: "100%",
    backgroundColor: CREAM,
    borderRadius: 20,
    padding: 14,
    boxSizing: "border-box",
    boxShadow: "0 12px 28px rgba(15,23,42,0.18)",
    color: "#111827",
  };

  const topRow: React.CSSProperties = {
    display: "flex",
    gap: 12,
    alignItems: "center",
  };

  const avatar: React.CSSProperties = {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(53,101,175,0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    color: "#3565AF",
    boxShadow: "0 10px 22px rgba(0,0,0,0.10)",
    flex: "0 0 auto",
  };

  const nameStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 16,
    fontWeight: 800,
    color: "#1f2937",
    lineHeight: 1.15,
  };

  const metaStyle: React.CSSProperties = {
    margin: "6px 0 0",
    fontSize: 12,
    fontWeight: 650,
    color: "#3565AF",
  };

  const subMeta: React.CSSProperties = {
    margin: "6px 0 0",
    fontSize: 12,
    fontWeight: 600,
    color: "#111827",
    opacity: 0.95,
  };

  const bioStyle: React.CSSProperties = {
    margin: "10px 0 0",
    fontSize: 13,
    fontWeight: 600,
    color: "#111827",
    lineHeight: 1.45,
    backgroundColor: "rgba(255,255,255,0.55)",
    border: "1px solid rgba(53,101,175,0.12)",
    borderRadius: 14,
    padding: 10,
  };

  const btnRowSmall: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
  };

  const btnSecondary: React.CSSProperties = {
    flex: "0 0 auto",
    height: 36,
    padding: "0 12px",
    borderRadius: 14,
    border: "2px solid rgba(42,95,151,0.35)",
    backgroundColor: "transparent",
    cursor: "pointer",
    color: "#3565AF",
    fontWeight: 750,
    fontSize: 13,
    lineHeight: "36px",
    whiteSpace: "nowrap",
  };

  const btnPrimary: React.CSSProperties = {
    flex: "0 0 auto",
    marginLeft: "auto",
    height: 40,
    padding: "0 14px",
    border: "none",
    borderRadius: 14,
    cursor: "pointer",
    backgroundColor: BTN,
    color: CREAM,
    fontWeight: 750,
    fontSize: 13,
    lineHeight: "40px",
    whiteSpace: "nowrap",
    boxShadow: "0 10px 20px rgba(0,0,0,0.14)",
  };

  const bottomNavStyle: React.CSSProperties = {
    width: "100%",
    backgroundColor: CREAM,
    padding: "10px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxSizing: "border-box",
    boxShadow: "0 -2px 12px rgba(15,23,42,0.15)",
    height: 52,
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
    fontWeight: 650,
  };

  // ================== MODAL STYLES ==================
  const overlayStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.62)",
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    boxSizing: "border-box",
    backdropFilter: "blur(8px)",
  };

  const modalStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: 420,
    backgroundColor: CREAM,
    borderRadius: 26,
    boxShadow: "0 22px 55px rgba(0,0,0,0.35)",
    overflow: "hidden",
    maxHeight: "86%",
    display: "flex",
    flexDirection: "column",
    border: "1px solid rgba(255,255,255,0.35)",
  };

  const modalHeaderStyle: React.CSSProperties = {
    padding: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background:
      "linear-gradient(180deg, rgba(107,167,230,0.20) 0%, rgba(245,233,217,1) 70%)",
    borderBottom: "1px solid rgba(53,101,175,0.15)",
  };

  const modalTitleStyle: React.CSSProperties = {
    fontWeight: 800,
    color: "#3565AF",
    fontSize: 16,
    letterSpacing: 0.2,
  };

  const closeBtnStyle: React.CSSProperties = {
    width: 44,
    height: 44,
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    backgroundColor: BLUE,
    color: CREAM,
    fontSize: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 22px rgba(0,0,0,0.14)",
  };

  const modalBodyStyle: React.CSSProperties = {
    padding: 14,
    overflowY: "auto",
  };

  // Profile popup styles
  const profileHero: React.CSSProperties = {
    background:
      "linear-gradient(135deg, rgba(53,101,175,0.14) 0%, rgba(244,197,143,0.28) 100%)",
    borderRadius: 20,
    padding: 14,
    border: "1px solid rgba(53,101,175,0.12)",
    boxShadow: "0 14px 28px rgba(15,23,42,0.12)",
  };

  const heroTopRow: React.CSSProperties = {
    display: "flex",
    gap: 12,
    alignItems: "center",
  };

  const heroAvatar: React.CSSProperties = {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "rgba(53,101,175,0.16)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    color: "#3565AF",
    boxShadow: "0 10px 22px rgba(0,0,0,0.10)",
    flex: "0 0 auto",
    fontSize: 18,
  };

  const heroName: React.CSSProperties = {
    margin: 0,
    fontSize: 20,
    fontWeight: 800,
    color: "#0f172a",
    lineHeight: 1.1,
  };

  const heroSub: React.CSSProperties = {
    marginTop: 6,
    fontSize: 12,
    fontWeight: 650,
    color: "#3565AF",
    opacity: 0.95,
  };

  const chipsRow: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  };

  const chip: React.CSSProperties = {
    padding: "8px 10px",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.75)",
    border: "1px solid rgba(53,101,175,0.12)",
    color: "#0f172a",
    fontWeight: 650,
    fontSize: 12,
  };

  const grid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginTop: 12,
  };

  const infoBox: React.CSSProperties = {
    backgroundColor: "rgba(255,255,255,0.65)",
    border: "1px solid rgba(53,101,175,0.12)",
    borderRadius: 16,
    padding: 12,
  };

  const infoLabel: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 750,
    color: "#3565AF",
    marginBottom: 6,
  };

  const infoValue: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 650,
    color: "#0f172a",
    lineHeight: 1.35,
    whiteSpace: "pre-wrap",
  };

  const bioBox: React.CSSProperties = {
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.65)",
    border: "1px solid rgba(53,101,175,0.12)",
    borderRadius: 16,
    padding: 12,
  };

  const stickyFooter: React.CSSProperties = {
    padding: 14,
    borderTop: "1px solid rgba(53,101,175,0.12)",
    backgroundColor: CREAM,
  };

  const ctaBtn: React.CSSProperties = {
    width: "100%",
    border: "none",
    borderRadius: 16,
    padding: "14px 14px",
    cursor: "pointer",
    backgroundColor: BTN,
    color: CREAM,
    fontWeight: 800,
    fontSize: 14,
    boxShadow: "0 12px 22px rgba(0,0,0,0.16)",
    whiteSpace: "nowrap",
  };

  // Intake popup styles
  const intakeCardStyle: React.CSSProperties = {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.45)",
    borderRadius: 16,
    padding: 12,
    boxSizing: "border-box",
    border: "1px solid rgba(53,101,175,0.12)",
  };

  const qStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 15,
    fontWeight: 800,
    color: "#1f2937",
    lineHeight: 1.35,
  };

  const hintStyle: React.CSSProperties = {
    marginTop: 6,
    fontSize: 12,
    fontWeight: 650,
    color: "#3565AF",
  };

  const inputWrap: React.CSSProperties = {
    width: "100%",
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.65)",
    padding: 12,
    boxSizing: "border-box",
    border: "1px solid rgba(53,101,175,0.12)",
    marginTop: 10,
  };

  const textareaStyle: React.CSSProperties = {
    width: "100%",
    minHeight: 90,
    border: "none",
    outline: "none",
    background: "transparent",
    resize: "vertical",
    fontSize: 14,
    fontWeight: 600,
    color: "#111827",
    lineHeight: 1.4,
  };

  const btnRow: React.CSSProperties = {
    display: "flex",
    gap: 10,
    marginTop: 10,
  };

  const primaryBtn: React.CSSProperties = {
    flex: 1,
    border: "none",
    borderRadius: 999,
    backgroundColor: "#2a5f97",
    color: CREAM,
    padding: "12px 14px",
    fontSize: 14,
    fontWeight: 800,
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
    fontWeight: 800,
    color: "#3565AF",
    cursor: "pointer",
  };

  const errorStyle: React.CSSProperties = {
    marginTop: 8,
    fontSize: 12,
    fontWeight: 750,
    color: "#7f1d1d",
    textAlign: "center",
  };

  const progressStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 750,
    color: "#3565AF",
    textAlign: "center",
    marginTop: 6,
  };

  // ✅ Choose time popup styles
  const chooseCard: React.CSSProperties = {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.45)",
    borderRadius: 18,
    padding: 12,
    boxSizing: "border-box",
    border: "1px solid rgba(53,101,175,0.12)",
  };

  const chooseLabel: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 750,
    color: "#3565AF",
    marginBottom: 6,
  };

  const pill: React.CSSProperties = {
    width: "100%",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.75)",
    paddingInline: 16,
    paddingBlock: 12,
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box",
    border: "1px solid rgba(53,101,175,0.14)",
    marginBottom: 12,
  };

  const inputStyle: React.CSSProperties = {
    border: "none",
    outline: "none",
    background: "transparent",
    width: "100%",
    fontSize: 14,
    fontWeight: 600,
    color: "#111827",
  };

  // ✅ Thank you screen (same idea as CheckIn)
  const thankScreenStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  };

  const dotsWrapperStyle: React.CSSProperties = {
    position: "absolute",
    bottom: 40,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: 8,
  };

  const dotBaseStyle: React.CSSProperties = {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "#0744ecff",
    opacity: 0.3,
    animationName: "dotPulse",
    animationDuration: "1s",
    animationIterationCount: "infinite",
    animationTimingFunction: "ease-in-out",
  };

  // ================== FETCH DIRECTORY ==================
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/psychologists`);
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  // ================== SEARCH (LOCAL FILTER) ==================
  const rendered = useMemo(() => {
    const query = normalize(q);
    if (!query) return items;

    const terms = query.split(/\s+/).filter(Boolean);

    return items.filter((p) => {
      const { specialty, city, workplace, bio, years } = getProfileFields(p);
      const haystack = normalize(
        [
          p.username ?? "",
          specialty ?? "",
          city ?? "",
          workplace ?? "",
          bio ?? "",
          years != null ? String(years) : "",
        ].join(" ")
      );
      return terms.every((t) => haystack.includes(t));
    });
  }, [items, q]);

  // ================== OPEN/CLOSE POPUPS ==================
  const resetIntakeState = () => {
    setStep(0);
    setAnswers({});
    setCurrent("");
    setIntakeErr(null);
    setIntakeSaving(false);
  };

  const resetChooseState = () => {
    setIntakeId(null);
    setDate("");
    setTime("");
    setApptErr(null);
    setApptSaving(false);
  };

  const closeAllPopups = () => {
    setProfileOpen(false);
    setIntakeOpen(false);
    setChooseOpen(false);
    setSelectedId(null);

    setProfileItem(null);
    setProfileErr(null);
    setProfileLoading(false);

    resetIntakeState();
    resetChooseState();
  };

  const openProfilePopup = async (id: string) => {
    setSelectedId(id);
    setProfileOpen(true);
    setIntakeOpen(false);
    setChooseOpen(false);

    resetIntakeState();
    resetChooseState();

    setProfileItem(null);
    setProfileErr(null);
    setProfileLoading(true);

    try {
      const res = await fetch(`${API_BASE}/psychologists/${id}`);
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "Failed to load psychologist");
      }
      const data = (await res.json()) as PsychologistPublic;
      setProfileItem(data);
    } catch (e: any) {
      setProfileItem(null);
      setProfileErr(e?.message || "Failed to load psychologist profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const openIntakePopup = (id: string) => {
    setSelectedId(id);
    setIntakeOpen(true);
    setProfileOpen(false);
    setChooseOpen(false);

    resetIntakeState();
    resetChooseState();
  };

  const openChoosePopup = (createdIntakeId: string) => {
    setIntakeId(createdIntakeId);
    setChooseOpen(true);
    setIntakeOpen(false);
    setProfileOpen(false);

    setDate("");
    setTime("");
    setApptErr(null);
    setApptSaving(false);
  };

  // ================== INTAKE LOGIC ==================
  const qItem = questions[step];

  const handleNext = () => {
    setIntakeErr(null);
    const v = current.trim();
    if (!v && qItem.key !== "notes") {
      setIntakeErr("Please answer before continuing.");
      return;
    }
    setAnswers((prev) => ({ ...prev, [qItem.key]: v }));
    setCurrent("");
    setStep((s) => Math.min(s + 1, questions.length - 1));
  };

  const handleBackStep = () => {
    setIntakeErr(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleFinish = async () => {
    if (!selectedId) {
      setIntakeErr("Missing psychologist id.");
      return;
    }

    const lastQ = questions[step];
    const finalAnswers = { ...answers, [lastQ.key]: current.trim() };

    for (const qq of questions) {
      if (qq.key === "notes") continue;
      if (!String(finalAnswers[qq.key] ?? "").trim()) {
        setIntakeErr("Please answer all required questions.");
        return;
      }
    }

    try {
      setIntakeSaving(true);
      setIntakeErr(null);

      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      const res = await fetch(`${API_BASE}/appointments/intake`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          psychologist_user_id: selectedId,
          answers: finalAnswers,
        }),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "Failed to create intake.");
      }

      const data = await res.json();
      const created = data?.intake_id as string | undefined;

      if (!created) throw new Error("Missing intake_id in response.");

      // ✅ open date/time popup (no routing)
      openChoosePopup(created);
    } catch (e: any) {
      setIntakeErr(e?.message || "Failed to submit. Please try again.");
    } finally {
      setIntakeSaving(false);
    }
  };

  // ================== APPOINTMENT REQUEST (DATE/TIME POPUP) ==================
  const submitAppointment = async () => {
    setApptErr(null);

    if (!selectedId) {
      setApptErr("Missing psychologist id.");
      return;
    }
    if (!intakeId) {
      setApptErr("Missing intake id. Please restart booking.");
      return;
    }
    if (!date || !time) {
      setApptErr("Please pick date and time.");
      return;
    }

    // local time -> ISO
    const iso = new Date(`${date}T${time}:00`).toISOString();

    try {
      setApptSaving(true);

      const token = localStorage.getItem("access_token");
      if (!token) return navigate("/login", { replace: true });

      const res = await fetch(`${API_BASE}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          psychologist_user_id: selectedId,
          intake_id: intakeId,
          start_at: iso,
        }),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "Failed to request appointment.");
      }

      // ✅ show thank-you image then go to journey
      closeAllPopups();
      setShowThanks(true);

      setTimeout(() => {
        navigate("/journey");
      }, 3000);
    } catch (e: any) {
      setApptErr(e?.message || "Failed to submit request.");
    } finally {
      setApptSaving(false);
    }
  };

  // ================== THANK YOU SCREEN ==================
  if (showThanks) {
    return (
      <div style={screenStyle}>
        <div style={phoneStyle}>
          <div style={thankScreenStyle}>
            <img
              src={thankYouImg}
              alt="Thank you"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />

            <div style={dotsWrapperStyle}>
              <span style={{ ...dotBaseStyle, animationDelay: "0s" }} />
              <span style={{ ...dotBaseStyle, animationDelay: "0.2s" }} />
              <span style={{ ...dotBaseStyle, animationDelay: "0.4s" }} />
            </div>

            <style>
              {`
              @keyframes dotPulse {
                0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
                40% { transform: scale(1); opacity: 1; }
              }
            `}
            </style>
          </div>
        </div>
      </div>
    );
  }

  // ================== UI ==================
  return (
    <div style={screenStyle}>
      <div style={phoneStyle}>
        {/* HEADER */}
        <div style={headerStyle}>
          <div style={headerRow}>
            <button type="button" style={iconBtn} onClick={() => navigate("/journey")} aria-label="Home" title="Home">
              🏠
            </button>

            <div style={brandRow}>
              <span style={tinyLogoStyle}>
                <img src={logo} alt="Mendly logo" style={tinyLogoImgStyle} />
              </span>
              <div style={brandTextWrap}>
                <div style={brandTitle}>Mendly App</div>
                <div style={brandSubtitle}>Find a psychologist</div>
              </div>
            </div>

            <button
              type="button"
              style={iconBtn}
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
        </div>

        {/* CONTENT */}
        <div style={contentStyle}>
          <div style={heroCard}>
            <p style={heroText}>Search by name, specialty, city, workplace, years of experience or bio.</p>

            <div style={searchWrap}>
              <div style={searchInputWrap}>
                <span style={searchIcon}>🔎</span>
                <input style={searchStyle} placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
              </div>

              <button
                type="button"
                style={clearBtn}
                onClick={() => setQ("")}
                aria-label="Clear search"
                title="Clear"
                disabled={!q.trim()}
              >
                ✕
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ color: CREAM, fontWeight: 750, textAlign: "center" }}>Loading...</div>
          ) : rendered.length === 0 ? (
            <div style={{ color: CREAM, fontWeight: 750, textAlign: "center" }}>
              No psychologists found for “{q.trim()}”.
            </div>
          ) : (
            <div style={listGap}>
              {rendered.map((p) => {
                const { specialty, city, workplace, bio, years } = getProfileFields(p);

                return (
                  <div key={p.user_id} style={card}>
                    <div style={topRow}>
                      <div style={avatar}>{initialsFromName(p.username)}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={nameStyle}>{p.username}</h3>
                        <div style={metaStyle}>
                          {safe(specialty)} • {safe(city)}
                        </div>
                        <div style={subMeta}>
                          {workplace?.trim() ? workplace : "—"}
                          {years != null ? ` • ${years} yrs` : ""}
                        </div>
                      </div>
                    </div>

                    {bio?.trim() ? <div style={bioStyle}>{bio}</div> : null}

                    <div style={btnRowSmall}>
                      <button type="button" style={btnSecondary} onClick={() => openProfilePopup(p.user_id)}>
                        View Profile
                      </button>

                      <button type="button" style={btnPrimary} onClick={() => openIntakePopup(p.user_id)}>
                        Book an Appointment
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* BOTTOM NAV */}
        <div style={bottomNavStyle}>
          <button type="button" style={navItemStyle} onClick={() => navigate("/profile")} aria-label="Profile">
            <div style={{ fontSize: 22 }}>👤</div>
            <div>Profile</div>
          </button>

          <button type="button" style={navItemStyle} onClick={() => navigate("/chat")} aria-label="AI Chat">
            <div style={{ fontSize: 22 }}>💬</div>
            <div>Ai Chat</div>
          </button>
        </div>

        {/* ================== PROFILE POPUP ================== */}
        {profileOpen && (
          <div style={overlayStyle} onClick={closeAllPopups} role="dialog" aria-modal="true">
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
              <div style={modalHeaderStyle}>
                <div style={modalTitleStyle}>Psychologist Profile</div>
                <button type="button" style={closeBtnStyle} onClick={closeAllPopups} aria-label="Close">
                  ✕
                </button>
              </div>

              <div style={modalBodyStyle}>
                {profileLoading ? (
                  <div style={{ textAlign: "center", fontWeight: 750, color: "#3565AF" }}>Loading...</div>
                ) : profileErr ? (
                  <div style={{ textAlign: "center", fontWeight: 750, color: "#7f1d1d" }}>{profileErr}</div>
                ) : !profileItem ? (
                  <div style={{ textAlign: "center", fontWeight: 750, color: "#3565AF" }}>Not found.</div>
                ) : (
                  <>
                    <div style={profileHero}>
                      <div style={heroTopRow}>
                        <div style={heroAvatar}>{initialsFromName(profileItem.username || "P")}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h2 style={heroName}>{safe(profileItem.username)}</h2>
                          <div style={heroSub}>
                            {safe(profileItem.specialty)} • {safe(profileItem.city)}
                          </div>
                        </div>
                      </div>

                      <div style={chipsRow}>
                        <div style={chip}>🏥 {profileItem.workplace?.trim() ? profileItem.workplace : "—"}</div>
                        <div style={chip}>
                          ⭐{" "}
                          {profileItem.years_experience != null
                            ? `${profileItem.years_experience} yrs exp`
                            : "— yrs exp"}
                        </div>
                      </div>
                    </div>

                    <div style={grid}>
                      <div style={infoBox}>
                        <div style={infoLabel}>Specialty</div>
                        <div style={infoValue}>{safe(profileItem.specialty)}</div>
                      </div>

                      <div style={infoBox}>
                        <div style={infoLabel}>City</div>
                        <div style={infoValue}>{safe(profileItem.city)}</div>
                      </div>

                      <div style={infoBox}>
                        <div style={infoLabel}>Workplace</div>
                        <div style={infoValue}>{safe(profileItem.workplace)}</div>
                      </div>

                      <div style={infoBox}>
                        <div style={infoLabel}>Experience</div>
                        <div style={infoValue}>
                          {profileItem.years_experience != null ? profileItem.years_experience : "—"}
                        </div>
                      </div>
                    </div>

                    <div style={bioBox}>
                      <div style={infoLabel}>Bio</div>
                      <div style={infoValue}>{safe(profileItem.bio)}</div>
                    </div>
                  </>
                )}
              </div>

              {!profileLoading && !profileErr && profileItem ? (
                <div style={stickyFooter}>
                  <button type="button" style={ctaBtn} onClick={() => openIntakePopup(profileItem.user_id)}>
                    Book an appointment
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* ================== INTAKE POPUP ================== */}
        {intakeOpen && (
          <div style={overlayStyle} onClick={closeAllPopups} role="dialog" aria-modal="true">
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
              <div style={modalHeaderStyle}>
                <div style={modalTitleStyle}>Quick Intake Questions</div>
                <button type="button" style={closeBtnStyle} onClick={closeAllPopups} aria-label="Close">
                  ✕
                </button>
              </div>

              <div style={modalBodyStyle}>
                <div style={intakeCardStyle}>
                  <p style={qStyle}>{qItem.label}</p>
                  {qItem.placeholder ? <div style={hintStyle}>{qItem.placeholder}</div> : null}

                  <div style={inputWrap}>
                    <textarea
                      style={textareaStyle}
                      value={current}
                      onChange={(e) => setCurrent(e.target.value)}
                      placeholder={qItem.placeholder || "Type here..."}
                    />
                  </div>

                  <div style={progressStyle}>
                    Step {step + 1} / {questions.length}
                  </div>

                  {intakeErr ? <div style={errorStyle}>{intakeErr}</div> : null}

                  <div style={btnRow}>
                    <button
                      type="button"
                      style={secondaryBtn}
                      onClick={handleBackStep}
                      disabled={intakeSaving || step === 0}
                    >
                      Back
                    </button>

                    {step < questions.length - 1 ? (
                      <button type="button" style={primaryBtn} onClick={handleNext} disabled={intakeSaving}>
                        Next
                      </button>
                    ) : (
                      <button type="button" style={primaryBtn} onClick={handleFinish} disabled={intakeSaving}>
                        {intakeSaving ? "Submitting..." : "Finish & Choose Time"}
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: 10, fontSize: 12, fontWeight: 650, color: "#3565AF", textAlign: "center" }}>
                  Your answers will be submitted when you finish.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================== CHOOSE DATE/TIME POPUP (NEW) ================== */}
        {chooseOpen && (
          <div style={overlayStyle} onClick={closeAllPopups} role="dialog" aria-modal="true">
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
              <div style={modalHeaderStyle}>
                <div style={modalTitleStyle}>Choose Date & Time</div>
                <button type="button" style={closeBtnStyle} onClick={closeAllPopups} aria-label="Close">
                  ✕
                </button>
              </div>

              <div style={modalBodyStyle}>
                <div style={chooseCard}>
                  <div style={chooseLabel}>Date</div>
                  <div style={pill}>
                    <input
                      style={inputStyle}
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>

                  <div style={chooseLabel}>Time</div>
                  <div style={pill}>
                    <input
                      style={inputStyle}
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
                  </div>

                  {apptErr ? <div style={errorStyle}>{apptErr}</div> : null}

                  <div style={btnRow}>
                    <button type="button" style={secondaryBtn} onClick={() => setChooseOpen(false)} disabled={apptSaving}>
                      Back
                    </button>
                    <button type="button" style={primaryBtn} onClick={submitAppointment} disabled={apptSaving}>
                      {apptSaving ? "Submitting..." : "Request Appointment"}
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: 10, fontSize: 12, fontWeight: 650, color: "#3565AF", textAlign: "center" }}>
                  After submitting, you’ll be redirected to Journey.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PsychologistsDirectoryPage;
