import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/mendly-logo.jpg";
import heroImage from "../assets/peace-quote.png";
import {
  getMoodSeries,
  type SeriesPoint,
} from "../api/auth";

const LOW_MOOD_THRESHOLD = 2; // <= avg → PHQ intro
const MEMORY_LOW_MOOD_THRESHOLD = 3; // <= avg → happy memories popup

// 🔹 API base for backend calls
const isNative = (window as any).Capacitor?.isNativePlatform?.() ?? false;
  const API_BASE =
    isNative
      ? "http://10.0.2.2:8000"                   // emulator → host machine
      : (import.meta.env.VITE_API_URL as string | undefined) ??
        "http://localhost:8000";

interface PendingMemory {
  id: string; // local-only id
  file: File;
  previewUrl: string; // URL.createObjectURL
  caption: string;
  memoryDate: string;
}

// Saved memory coming from backend
interface HappyMemory {
  memory_id: string;
  image_url: string;
  caption: string | null;
  memory_date: string | null;
  created_at: string;
}

const JourneyOverviewPage: React.FC = () => {
  const navigate = useNavigate();

  const BLUE = "#6BA7E6";
  const CREAM = "#f5e9d9";

  // ===== Mood tracking tips for the Posts card =====
  const moodTips: string[] = [
    "Notice how your sleep affects your mood.",
    "Track how different foods make you feel.",
    "Write down how movement or exercise changes your emotions.",
    "Pay attention to how time with people impacts your mood.",
    "Name your emotions — it can reduce their intensity.",
    "Look for patterns between your daily habits and how you feel.",
    "Use what you learn to make choices that support your well-being.",
  ];

  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // ===== Mood data for last 14 days (for PHQ / memories trigger) =====
  const [series14, setSeries14] = useState<SeriesPoint[] | null>(null);
  const [loadingMood, setLoadingMood] = useState<boolean>(true);
  const [moodError, setMoodError] = useState<string | null>(null);

  // 🔹 screening status from backend
  const [lastPhq2Date, setLastPhq2Date] = useState<string | null>(null);
  const [lastPhotoMemoriesDate, setLastPhotoMemoriesDate] =
    useState<string | null>(null);
  const [screeningStatusLoaded, setScreeningStatusLoaded] =
    useState<boolean>(false);

  // should we show the PHQ intro popup?
  const [showScreeningIntro, setShowScreeningIntro] = useState(false);

  // Weekly happy photo reminder
  const [photoReminder, setPhotoReminder] = useState<{
    image_url: string;
    caption: string | null;
    message: string;
  } | null>(null);

  // 🔹 Happy memories modal state (manual add)
  const [showMemoriesModal, setShowMemoriesModal] = useState(false);

  // 👉 LOCAL pending memories (only in modal until user saves all)
  const [pendingMemories, setPendingMemories] = useState<PendingMemory[]>([]);
  const [memoriesError, setMemoriesError] = useState<string | null>(null);
  const [savingAll, setSavingAll] = useState(false);

  // inline “new memory” fields
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newCaption, setNewCaption] = useState("");
  const [newMemoryDate, setNewMemoryDate] = useState("");

  // 🔹 Auto “low mood memories” popup (read-only gallery)
  const [showAutoMemoriesOverlay, setShowAutoMemoriesOverlay] =
    useState(false);
  const [autoMemories, setAutoMemories] = useState<HappyMemory[]>([]);
  const [autoMemoriesLoading, setAutoMemoriesLoading] = useState(false);
  const [autoMemoriesError, setAutoMemoriesError] = useState<string | null>(
    null
  );

  // 🔍 full-screen image inside the auto-memories popup
  const [fullScreenAutoMemory, setFullScreenAutoMemory] = useState<{
    src: string;
    caption: string | null;
  } | null>(null);

  // --- fetch last 14-day mood series once ---
  useEffect(() => {
    let cancelled = false;

    const fetchMood = async () => {
      try {
        setLoadingMood(true);
        const data = await getMoodSeries(14);
        if (!cancelled) {
          setSeries14(data);
          setMoodError(null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load mood series", err);
          setMoodError("Failed to load mood data");
        }
      } finally {
        if (!cancelled) {
          setLoadingMood(false);
        }
      }
    };

    fetchMood();
    return () => {
      cancelled = true;
    };
  }, []);

  // --- fetch screening status (last PHQ-2 date + last memories popup date) ---
  useEffect(() => {
    let cancelled = false;

    const fetchStatus = async () => {
      try {
        const token = window.localStorage.getItem("access_token");
        if (!token) {
          if (!cancelled) setScreeningStatusLoaded(true);
          return;
        }

        const res = await fetch(`${API_BASE}/screenings/status`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error("Failed to fetch screening status:", res.status);
          if (!cancelled) setScreeningStatusLoaded(true);
          return;
        }

        const data: {
          last_phq2_date: string | null;
          last_photo_memory_date: string | null;
        } = await res.json();

        if (!cancelled) {
          setLastPhq2Date(data.last_phq2_date);
          setLastPhotoMemoriesDate(data.last_photo_memory_date);
          setScreeningStatusLoaded(true);
        }
      } catch (err) {
        console.error("Error fetching screening status:", err);
        if (!cancelled) setScreeningStatusLoaded(true);
      }
    };

    fetchStatus();
    return () => {
      cancelled = true;
    };
  }, []);

  // --- helper: mark in DB that memories popup was shown today ---
  const markMemoriesPopupShownToday = async () => {
    try {
      const token = window.localStorage.getItem("access_token");
      if (!token) return;

      const res = await fetch(`${API_BASE}/screenings/photo-popup-seen`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const today = new Date().toISOString().slice(0, 10);
        setLastPhotoMemoriesDate(today);
      }
    } catch (err) {
      console.error("Failed to mark memories popup as seen", err);
    }
  };

  // --- helper: open auto memories popup (load all saved memories from backend) ---
  const openAutoMemoriesPopup = async () => {
    try {
      const token = window.localStorage.getItem("access_token");
      if (!token) return;

      setAutoMemoriesLoading(true);
      setAutoMemoriesError(null);

      const res = await fetch(`${API_BASE}/photo-memories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("Failed to load auto memories", res.status);
        setAutoMemoriesError("Could not load your happy memories.");
        return;
      }

      const data: HappyMemory[] = await res.json();
      if (data.length > 0) {
        setAutoMemories(data);
        setShowAutoMemoriesOverlay(true);
        await markMemoriesPopupShownToday();
      }
    } catch (err) {
      console.error("Error loading auto memories", err);
      setAutoMemoriesError("Could not load your happy memories.");
    } finally {
      setAutoMemoriesLoading(false);
    }
  };

  // --- decide when to show PHQ intro and when to show memories popup (once per day) ---
  useEffect(() => {
    if (loadingMood || !screeningStatusLoaded) return;
    if (!series14 || series14.length === 0) return;

    const numericValues = series14
      .map((p) => p.avg_score)
      .filter((v): v is number => typeof v === "number");

    if (!numericValues.length) return;

    const rawAvg =
      numericValues.reduce((sum, v) => sum + v, 0) / numericValues.length;
    const avg = Number(rawAvg.toFixed(1));

    const today = new Date().toISOString().slice(0, 10);

    const lastScreenDate =
      lastPhq2Date && typeof lastPhq2Date === "string"
        ? lastPhq2Date.slice(0, 10)
        : null;

    const lastMemoriesDate =
      lastPhotoMemoriesDate && typeof lastPhotoMemoriesDate === "string"
        ? lastPhotoMemoriesDate.slice(0, 10)
        : null;

    const alreadyScreenedToday = lastScreenDate === today;
    const alreadySawMemoriesToday = lastMemoriesDate === today;

    // 1) PHQ intro if avg <= 2 and not yet screened today
    if (avg <= LOW_MOOD_THRESHOLD && !alreadyScreenedToday) {
      setShowScreeningIntro(true);
      return;
    }

    // 2) Memories popup if avg <= 3 and NOT already shown today
    if (avg <= MEMORY_LOW_MOOD_THRESHOLD && !alreadySawMemoriesToday) {
      void openAutoMemoriesPopup();
    }
  }, [
    loadingMood,
    screeningStatusLoaded,
    series14,
    lastPhq2Date,
    lastPhotoMemoriesDate,
  ]);

  // ===== auto-rotate tips every 5 seconds (when not paused) =====
  useEffect(() => {
    if (isPaused) return;

    const id = window.setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % moodTips.length);
    }, 5000);

    return () => window.clearInterval(id);
  }, [isPaused, moodTips.length]);

  // ===== weekly photo candidate fetch (also once per day per user) =====
  useEffect(() => {
    if (!screeningStatusLoaded) return;

    const today = new Date().toISOString().slice(0, 10);
    const lastMemoriesDate =
      lastPhotoMemoriesDate && typeof lastPhotoMemoriesDate === "string"
        ? lastPhotoMemoriesDate.slice(0, 10)
        : null;

    const alreadySawMemoriesToday = lastMemoriesDate === today;
    if (alreadySawMemoriesToday) {
      // already showed some memories today (either low-mood popup or weekly),
      // so skip this weekly reminder
      return;
    }
  }, [screeningStatusLoaded, lastPhotoMemoriesDate]);

  const handleHoldStart = () => setIsPaused(true);
  const handleHoldEnd = () => setIsPaused(false);

  const secondTipIndex = (currentTipIndex + 1) % moodTips.length;
  const thirdTipIndex = (secondTipIndex + 1) % moodTips.length;

  // ===== Happy memories: LOCAL helpers (add & save) =====

  // Add one memory to the local list (DOES NOT upload yet)
  const handleAddPendingMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFile) {
      setMemoriesError("Please choose an image file.");
      return;
    }

    const id =
      window.crypto && "randomUUID" in window.crypto
        ? (window.crypto.randomUUID as () => string)()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const previewUrl = URL.createObjectURL(newFile);

    setPendingMemories((prev) => [
      ...prev,
      {
        id,
        file: newFile,
        previewUrl,
        caption: newCaption.trim(),
        memoryDate: newMemoryDate,
      },
    ]);

    // reset inline inputs
    setNewFile(null);
    setNewCaption("");
    setNewMemoryDate("");
    const inputEl = document.getElementById(
      "happy-photo-input-inline"
    ) as HTMLInputElement | null;
    if (inputEl) {
      inputEl.value = "";
    }
    setMemoriesError(null);
  };

  // Edit caption or date of a local pending memory
  const handlePendingFieldChange = (
    id: string,
    field: "caption" | "memoryDate",
    value: string
  ) => {
    setPendingMemories((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              [field]: value,
            }
          : m
      )
    );
  };

  // Delete from modal only (does NOT touch backend)
  const handleRemovePendingMemory = (id: string) => {
    setPendingMemories((prev) => {
      const target = prev.find((m) => m.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((m) => m.id !== id);
    });
  };

  // Save ALL pending memories to backend, then clear + go to /photo-memories
  const handleSaveAllMemories = async () => {
    if (!pendingMemories.length) {
      setMemoriesError("Add at least one photo before saving.");
      return;
    }

    try {
      setSavingAll(true);
      setMemoriesError(null);

      const token = window.localStorage.getItem("access_token");
      if (!token) {
        setMemoriesError("You must be logged in.");
        setSavingAll(false);
        return;
      }

      for (const mem of pendingMemories) {
        const formData = new FormData();
        formData.append("file", mem.file);
        if (mem.caption.trim()) formData.append("caption", mem.caption.trim());
        if (mem.memoryDate) formData.append("memory_date", mem.memoryDate);

        const res = await fetch(`${API_BASE}/photo-memories/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!res.ok) {
          let detail = "Could not upload one of the photos.";
          try {
            const data = await res.json();
            if (data.detail) detail = data.detail;
          } catch {
            /* ignore */
          }
          setMemoriesError(detail);
          setSavingAll(false);
          return;
        }
      }

      // success → clean previews + clear list, close modal, go to memories page
      pendingMemories.forEach((m) => URL.revokeObjectURL(m.previewUrl));
      setPendingMemories([]);
      setShowMemoriesModal(false);
      navigate("/photo-memories");
    } catch (err) {
      console.error("Error uploading memories", err);
      setMemoriesError("Could not upload the photos.");
    } finally {
      setSavingAll(false);
    }
  };

  // cleanup previews on unmount
  useEffect(
    () => () => {
      pendingMemories.forEach((m) => URL.revokeObjectURL(m.previewUrl));
    },
    [pendingMemories]
  );

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
    height: "30px",
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
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.12)",
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
    fontSize: 20,
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

  // CONTENT AREA
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
    gap: 16,
    alignItems: "center",
  };

  const cardStyle: React.CSSProperties = {
    width: "100%",
    backgroundColor: CREAM,
    borderRadius: 24,
    padding: "14px 16px 16px 16px",
    color: "#374151",
    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.18)",
    boxSizing: "border-box",
  };

  const heroImageCard: React.CSSProperties = {
    width: "100%",
    height: 150,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  const heroMediaStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  };

  const actionBtn: React.CSSProperties = {
    border: "none",
    cursor: "pointer",
    borderRadius: 999,
    backgroundColor: "#2a5f97ff",
    color: CREAM,
    padding: "12px 14px",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.12)",
    fontWeight: 700,
    width: "100%",
    fontSize: 14,
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
    boxShadow: "0 -2px 10px rgba(15, 23, 42, 0.15)",
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
    fontSize: 13,
  };

  const bulletListStyle: React.CSSProperties = {
    listStyleType: "disc",
    paddingLeft: "1.2rem",
    margin: 0,
  };

  const bulletItemStyle: React.CSSProperties = {
    fontSize: 13,
    opacity: 0.9,
    lineHeight: 1.4,
  };

  const helperPauseStyle: React.CSSProperties = {
    marginTop: 8,
    fontSize: 11,
    opacity: 0.65,
  };

  // Popups
  const overlayStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 40,
    backdropFilter: "blur(6px)",
  };

  const modalStyle: React.CSSProperties = {
    width: "88%",
    maxWidth: 360,
    backgroundColor: CREAM,
    borderRadius: 24,
    padding: "20px 18px 18px 18px",
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.35)",
    color: "#111827",
    boxSizing: "border-box",
    textAlign: "left",
  };

  const modalTitleStyle: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 8,
  };

  const modalBodyStyle: React.CSSProperties = {
    fontSize: 14,
    lineHeight: 1.5,
    marginBottom: 12,
  };

  const modalNoteStyle: React.CSSProperties = {
    fontSize: 11,
    opacity: 0.7,
    marginBottom: 14,
  };

  const modalBtnStyle: React.CSSProperties = {
    ...actionBtn,
    width: "100%",
    paddingBlock: 10,
  };

  // Happy memories modal styles
  const memoriesOverlayStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 45,
    backdropFilter: "blur(8px)",
  };

  const memoriesModalStyle: React.CSSProperties = {
    width: "94%",
    maxWidth: 420,
    maxHeight: "82%",
    background:
      "linear-gradient(145deg, #fef9c3 0%, #f5e9d9 35%, #e0ecff 100%)",
    borderRadius: 26,
    padding: "14px 14px 16px 14px",
    boxShadow: "0 20px 45px rgba(15, 23, 42, 0.5)",
    color: "#111827",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  };

  const memoriesHeaderRow: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  };

  const smallIconBtn: React.CSSProperties = {
    border: "none",
    borderRadius: 999,
    width: 28,
    height: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e5e7eb",
    cursor: "pointer",
    boxShadow: "0 3px 8px rgba(15, 23, 42, 0.15)",
  };

  const memoriesUploadRow: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: 6,
    padding: 8,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  };

  const memoriesInputRow: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center",
  };

  const smallInput: React.CSSProperties = {
    borderRadius: 8,
    border: "1px solid #d1d5db",
    padding: "4px 6px",
    fontSize: 12,
    flex: "1 1 120px",
  };

  const smallUploadBtn: React.CSSProperties = {
    border: "none",
    borderRadius: 999,
    padding: "7px 12px",
    backgroundColor: "#2563eb",
    color: "#f9fafb",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    boxShadow: "0 4px 10px rgba(37, 99, 235, 0.3)",
  };

  const memoriesGrid: React.CSSProperties = {
    flex: 1,
    overflowY: "auto",
    marginTop: 4,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
    gap: 8,
    paddingRight: 2,
  };

  const memoriesCard: React.CSSProperties = {
    backgroundColor: CREAM,
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "0 6px 16px rgba(15, 23, 42, 0.18)",
    display: "flex",
    flexDirection: "column",
    minHeight: 165,
  };

  const memoriesImgWrapper: React.CSSProperties = {
    width: "100%",
    height: 90,
    overflow: "hidden",
    cursor: "pointer",
  };

  const memoriesImg: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  const memoriesBody: React.CSSProperties = {
    padding: "4px 6px 6px 6px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  };

  const tinyLabel: React.CSSProperties = {
    fontSize: 10,
    color: "#4b5563",
  };

  const tinyInput: React.CSSProperties = {
    borderRadius: 8,
    border: "1px solid #d1d5db",
    padding: "2px 4px",
    fontSize: 11,
    width: "100%",
    height: 26,
    boxSizing: "border-box",
  };

  const tinyButtonsRow: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    gap: 4,
    marginTop: 2,
  };

  const tinyBtn: React.CSSProperties = {
    border: "none",
    borderRadius: 999,
    padding: "3px 6px",
    fontSize: 10,
    fontWeight: 600,
    cursor: "pointer",
    flex: 1,
  };

  // full-screen image overlay style (auto memories)
  const fullScreenOverlay: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(15,23,42,0.9)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 55,
  };

  const fullScreenInner: React.CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100%",
    maxWidth: 450,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: 12,
    boxSizing: "border-box",
  };

  const fullScreenImgWrapper: React.CSSProperties = {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    boxShadow: "0 20px 45px rgba(0,0,0,0.7)",
  };

  const fullScreenImg: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    backgroundColor: "black",
  };

  const fullScreenCaption: React.CSSProperties = {
    marginTop: 10,
    color: "#e5e7eb",
    fontSize: 14,
    textAlign: "center",
  };

  const fullScreenCloseBtn: React.CSSProperties = {
    position: "absolute",
    top: 20,
    right: 20,
    border: "none",
    borderRadius: 999,
    width: 34,
    height: 34,
    backgroundColor: "rgba(15,23,42,0.9)",
    color: "#f9fafb",
    cursor: "pointer",
    fontSize: 18,
    boxShadow: "0 8px 20px rgba(0,0,0,0.6)",
  };

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
                <img
                  src={logo}
                  alt="Mendly logo"
                  style={tinyLogoImgStyle}
                />
              </span>
              Mendly App
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
        <div style={bottomSectionStyle}>
          {/* Hero image full width, directly under nav */}
          <div style={heroImageCard}>
            <img
              src={heroImage}
              alt="You have the power to protect your peace"
              style={heroMediaStyle}
            />
          </div>

          <div style={innerContentStyle}>
            {/* four main buttons */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                width: "100%",
              }}
            >
              <button
                type="button"
                style={{ ...actionBtn, paddingBlock: 14 }}
                onClick={() => navigate("/check-in")}
              >
                Check in
              </button>

              <button
                type="button"
                style={{ ...actionBtn, paddingBlock: 14 }}
                onClick={() => navigate("/support")}
              >
                Find support
              </button>

              <button
                type="button"
                style={{ ...actionBtn, paddingBlock: 14 }}
                onClick={() => navigate("/breath")}
              >
                Breath Training
              </button>

              <button
                type="button"
                style={{ ...actionBtn, paddingBlock: 14 }}
                onClick={() => navigate("/mood-track")}
              >
                Mood Track
              </button>

              <button
                type="button"
                style={{ ...actionBtn, paddingBlock: 14 }}
                onClick={() => navigate("/psychologists")}
              >
                Find a Psychologist
              </button>
            </div>

            {/* Positive Notifications button – full width */}
            <button
              type="button"
              style={{ ...actionBtn, marginTop: 4 }}
              onClick={() => navigate("/positive")}
            >
              Positive Notifications / Motivation Notes
            </button>

            {/* Posts teaser – rotating tips (3 at a time) */}
            <div
              style={{ ...cardStyle }}
              onMouseDown={handleHoldStart}
              onMouseUp={handleHoldEnd}
              onMouseLeave={handleHoldEnd}
              onTouchStart={handleHoldStart}
              onTouchEnd={handleHoldEnd}
            >
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Posts</div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 13,
                  marginBottom: 4,
                }}
              >
                Why Mood Tracking Works
              </div>
              <ul style={bulletListStyle}>
                <li style={bulletItemStyle}>{moodTips[currentTipIndex]}</li>
                <li style={bulletItemStyle}>{moodTips[secondTipIndex]}</li>
                <li style={bulletItemStyle}>{moodTips[thirdTipIndex]}</li>
              </ul>
              <div style={helperPauseStyle}>
                {isPaused
                  ? "Release to keep exploring more tips."
                  : "Tap & hold to pause these tips."}
              </div>
              {moodError && (
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    color: "#b91c1c",
                  }}
                >
                  {moodError}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM NAV  (📷 camera button kept in the middle item) */}
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
            onClick={() => setShowMemoriesModal(true)}
            role="button"
            aria-label="Add happy memory"
          >
            <div style={{ fontSize: 22 }}>📷</div>
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

        {/* ===== PHQ INTRO POPUP ===== */}
        {showScreeningIntro && (
          <div style={overlayStyle}>
            <div style={modalStyle}>
              <div style={modalTitleStyle}>Short wellbeing check</div>
              <div style={modalBodyStyle}>
                We noticed that your mood has been a bit low over the last
                couple of weeks. We’d like to offer you a very short
                questionnaire (2 quick questions) to better understand how
                you’ve been feeling.
              </div>
              <div style={modalNoteStyle}>
                This is not a diagnosis. It’s a screening tool to help you
                and, if you choose, your care team. You can stop using the
                app at any time.
              </div>
              <button
                type="button"
                style={modalBtnStyle}
                onClick={() => {
                  setShowScreeningIntro(false);
                  navigate("/phq2");
                }}
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* ===== Weekly Happy Photo popup ===== */}
        {photoReminder && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(15, 23, 42, 0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 35,
              backdropFilter: "blur(6px)",
            }}
          >
            <div
              style={{
                width: "88%",
                maxWidth: 360,
                backgroundColor: CREAM,
                borderRadius: 24,
                padding: "18px 16px 16px 16px",
                boxShadow: "0 18px 40px rgba(15, 23, 42, 0.35)",
                color: "#111827",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "100%",
                  borderRadius: 18,
                  overflow: "hidden",
                  marginBottom: 10,
                }}
              >
                <img
                  src={photoReminder.image_url}
                  alt="Happy memory"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>
                {photoReminder.message}
              </div>
              {photoReminder.caption && (
                <div
                  style={{
                    fontSize: 13,
                    color: "#4b5563",
                    marginBottom: 10,
                  }}
                >
                  “{photoReminder.caption}”
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setPhotoReminder(null);
                  void markMemoriesPopupShownToday();
                }}
                style={{
                  border: "none",
                  borderRadius: 999,
                  padding: "8px 16px",
                  backgroundColor: "#2a5f97ff",
                  color: CREAM,
                  fontWeight: 600,
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* ===== Auto Memories Popup (read-only gallery, once per day) ===== */}
        {showAutoMemoriesOverlay && (
          <div style={memoriesOverlayStyle}>
            <div style={memoriesModalStyle}>
              <div style={memoriesHeaderRow}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span role="img" aria-label="sparkles">
                    ✨
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>
                    A few moments to remember
                  </span>
                </div>
                <button
                  type="button"
                  style={smallIconBtn}
                  onClick={() => setShowAutoMemoriesOverlay(false)}
                >
                  ✕
                </button>
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: "#4b5563",
                  marginBottom: 4,
                }}
              >
                When things feel heavy, it can help to look back at moments
                that made you smile. Here are some of yours. 💙
              </div>

              {autoMemoriesLoading ? (
                <div
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                    paddingTop: 8,
                  }}
                >
                  Loading your memories…
                </div>
              ) : autoMemoriesError ? (
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 11,
                    color: "#b91c1c",
                  }}
                >
                  {autoMemoriesError}
                </div>
              ) : autoMemories.length === 0 ? (
                <div
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                    paddingTop: 8,
                  }}
                >
                  You don&apos;t have any saved memories yet. You can add some
                  from the camera button below. 📷
                </div>
              ) : (
                <div style={memoriesGrid}>
                  {autoMemories.map((m) => {
                    const imgSrc = m.image_url.startsWith("http")
                      ? m.image_url
                      : `${API_BASE}${
                          m.image_url.startsWith("/") ? "" : "/"
                        }${m.image_url}`;
                    return (
                      <div key={m.memory_id} style={memoriesCard}>
                        <div
                          style={memoriesImgWrapper}
                          onClick={() =>
                            setFullScreenAutoMemory({
                              src: imgSrc,
                              caption: m.caption,
                            })
                          }
                        >
                          <img
                            src={imgSrc}
                            alt={m.caption ?? "Happy memory"}
                            style={memoriesImg}
                          />
                        </div>
                        <div style={memoriesBody}>
                          {m.caption && (
                            <div style={{ fontSize: 11 }}>
                              “{m.caption}”
                            </div>
                          )}
                          {m.memory_date && (
                            <div
                              style={{
                                fontSize: 10,
                                color: "#4b5563",
                              }}
                            >
                              {m.memory_date}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* full-screen image inside auto-memories popup */}
        {fullScreenAutoMemory && (
          <div style={fullScreenOverlay}>
            <div style={fullScreenInner}>
              <button
                type="button"
                style={fullScreenCloseBtn}
                onClick={() => setFullScreenAutoMemory(null)}
                aria-label="Close"
              >
                ✕
              </button>
              <div style={fullScreenImgWrapper}>
                <img
                  src={fullScreenAutoMemory.src}
                  alt={fullScreenAutoMemory.caption ?? "Happy memory"}
                  style={fullScreenImg}
                />
              </div>
              {fullScreenAutoMemory.caption && (
                <div style={fullScreenCaption}>
                  “{fullScreenAutoMemory.caption}”
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== Happy Memories Modal (staging area, then Save all) ===== */}
        {showMemoriesModal && (
          <div style={memoriesOverlayStyle}>
            <div style={memoriesModalStyle}>
              <div style={memoriesHeaderRow}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span role="img" aria-label="camera">
                    📷
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>
                    Happy Photo Memories
                  </span>
                </div>
                <button
                  type="button"
                  style={smallIconBtn}
                  onClick={() => setShowMemoriesModal(false)}
                >
                  ✕
                </button>
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: "#4b5563",
                  marginBottom: 4,
                }}
              >
                Add a few photos that make you smile. They’ll be saved only when
                you hit <strong>Save all</strong>. 💙
              </div>

              {/* Inline upload → adds to local list only */}
              <form onSubmit={handleAddPendingMemory} style={memoriesUploadRow}>
                <div style={memoriesInputRow}>
                  <input
                    id="happy-photo-input-inline"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setNewFile(
                        e.target.files && e.target.files[0]
                          ? e.target.files[0]
                          : null
                      )
                    }
                    style={{ fontSize: 11, flex: "1 1 150px" }}
                  />
                  <input
                    type="text"
                    placeholder="Caption (optional)"
                    value={newCaption}
                    onChange={(e) => setNewCaption(e.target.value)}
                    style={smallInput}
                  />
                  <input
                    type="date"
                    value={newMemoryDate}
                    onChange={(e) => setNewMemoryDate(e.target.value)}
                    style={smallInput}
                  />
                  <button type="submit" style={smallUploadBtn}>
                    Add to list
                  </button>
                </div>
              </form>

              {/* Save-all + link to gallery */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 4,
                  paddingInline: 2,
                }}
              >
                <button
                  type="button"
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: 12,
                    color: "#2563eb",
                    textDecoration: "underline",
                    cursor: "pointer",
                    padding: 0,
                  }}
                  onClick={() => {
                    setShowMemoriesModal(false);
                    navigate("/photo-memories");
                  }}
                >
                  Open my gallery →
                </button>

                <button
                  type="button"
                  onClick={handleSaveAllMemories}
                  disabled={savingAll}
                  style={{
                    border: "none",
                    borderRadius: 999,
                    padding: "6px 12px",
                    backgroundColor: savingAll ? "#9ca3af" : "#2563eb",
                    color: "#f9fafb",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: savingAll ? "default" : "pointer",
                    boxShadow: "0 4px 10px rgba(37, 99, 235, 0.3)",
                  }}
                >
                  {savingAll ? "Saving..." : "Save all"}
                </button>
              </div>

              {memoriesError && (
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 11,
                    color: "#b91c1c",
                  }}
                >
                  {memoriesError}
                </div>
              )}

              {/* List of pending memories (small grid, local only) */}
              <div style={memoriesGrid}>
                {pendingMemories.length === 0 ? (
                  <div
                    style={{
                      fontSize: 12,
                      color: "#6b7280",
                      gridColumn: "1 / -1",
                      textAlign: "center",
                      paddingTop: 8,
                    }}
                  >
                    No photos in this list yet. Add a happy moment above 🌱
                  </div>
                ) : (
                  pendingMemories.map((m) => (
                    <div key={m.id} style={memoriesCard}>
                      <div style={memoriesImgWrapper}>
                        <img
                          src={m.previewUrl}
                          alt={m.caption || "Happy memory"}
                          style={memoriesImg}
                        />
                      </div>
                      <div style={memoriesBody}>
                        <div style={tinyLabel}>Caption</div>
                        <input
                          type="text"
                          value={m.caption}
                          onChange={(e) =>
                            handlePendingFieldChange(
                              m.id,
                              "caption",
                              e.target.value
                            )
                          }
                          style={{ ...tinyInput, height: 24 }}
                        />

                        <div style={tinyLabel}>Date</div>
                        <input
                          type="date"
                          value={m.memoryDate}
                          onChange={(e) =>
                            handlePendingFieldChange(
                              m.id,
                              "memoryDate",
                              e.target.value
                            )
                          }
                          style={tinyInput}
                        />

                        <div style={tinyButtonsRow}>
                          <button
                            type="button"
                            style={{
                              ...tinyBtn,
                              backgroundColor: "#dc2626",
                              color: "#f9fafb",
                            }}
                            onClick={() => handleRemovePendingMemory(m.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JourneyOverviewPage;