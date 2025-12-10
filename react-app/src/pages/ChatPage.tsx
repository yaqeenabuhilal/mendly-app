// react-app/src/pages/ChatPage.tsx
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/mendly-logo.jpg";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

type TopicKey =
  | "anxiety"
  | "low_mood"
  | "stress"
  | "sleep"
  | "motivation"
  | "routine";

interface SuggestionQA {
  id: number;
  topic: TopicKey;
  question: string;
  answer: string;
}

// All saved questions + answers
const SUGGESTED_QA: SuggestionQA[] = [
  {
    id: 1,
    topic: "anxiety",
    question: "How can I calm down when I feel anxious?",
    answer:
      "When anxiety shows up, start with your body: take 5 slow breaths (inhale 4s, hold 2s, exhale 6s). Then name what you feel in one sentence, like “I’m worried about tomorrow’s exam.” Finally, pick one tiny step that helps—preparing your bag, planning a break, or texting someone you trust.",
  },
  {
    id: 2,
    topic: "low_mood",
    question: "What can I do if I'm feeling sad or low today?",
    answer:
      "Low days are normal and temporary. Try three small things: 1) get light and fresh air for 2–5 minutes, 2) move gently (short walk, stretches), 3) reach out to one safe person with a simple message like “Today feels heavy.” You don’t need to fix everything—just support yourself for today.",
  },
  {
    id: 3,
    topic: "stress",
    question: "How can I deal with stress from school or work?",
    answer:
      "Write down everything stressing you into a quick list. Then choose ONE task you can move forward in 10–15 minutes and focus only on that. Turn off other tabs/notifications while you do it. After that, take a short break and choose the next small step. Progress in tiny pieces beats trying to handle everything at once.",
  },
  {
    id: 4,
    topic: "sleep",
    question: "What should I do before sleep to relax my mind?",
    answer:
      "About 30 minutes before sleep, switch to a “wind-down mode”: lower the lights, put your phone away, and do something calm like reading, stretching, or listening to soft music. Write tomorrow’s tasks on paper so your brain doesn’t keep repeating them. As you lie in bed, focus on breathing slowly and relaxing your shoulders.",
  },
  {
    id: 5,
    topic: "motivation",
    question: "How do I stay motivated when I feel tired or lazy?",
    answer:
      "Shrink the goal until it feels almost too easy: instead of “finish everything,” try “work for 5–10 minutes” or “start the first question.” Tell yourself you can stop after that. Often motivation appears after you begin. Also check basics—sleep, food, and breaks—because low energy can look like low motivation.",
  },
  {
    id: 6,
    topic: "routine",
    question: "How can I build a more positive daily routine?",
    answer:
      "Pick 1–2 tiny habits to start with, like a 3-minute morning stretch or writing one sentence about how you feel at night. Attach each habit to something you already do—after brushing your teeth, after lunch, or before bed. Keep them small and track them for a week; the goal is consistency, not perfection.",
  },
  {
    id: 7,
    topic: "anxiety",
    question: "What can I do during a panic or strong anxiety spike?",
    answer:
      "Try a grounding exercise: notice 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. Keep your feet firmly on the floor while you breathe out longer than you breathe in. The goal isn’t to erase anxiety, just to help your body feel a little safer.",
  },
  {
    id: 8,
    topic: "low_mood",
    question: "How do I cope when I feel lonely?",
    answer:
      "Start with one light connection: send a meme, a short voice note, or “hey, how are you?” to someone you trust. You can also create tiny moments of warmth for yourself—comforting music, a warm drink, or a favorite show. Loneliness wants you to disconnect; doing the opposite in small ways slowly weakens it.",
  },
  {
    id: 9,
    topic: "stress",
    question: "How can I organize my day so I feel less overwhelmed?",
    answer:
      "Use a 3-part list: MUST-do (max 3 items), SHOULD-do, and NICE-to-do. Start with one MUST item and protect 25 minutes for it—no phone, no switching tasks. When it’s done, take a 5-minute break. Seeing tasks in groups often makes the day feel more manageable.",
  },
  {
    id: 10,
    topic: "sleep",
    question: "What can I do if my thoughts race at night?",
    answer:
      "Keep a small notebook next to your bed. When thoughts start racing, write them down like a “brain download”—no editing. Remind yourself, “My list is safe here, I’ll look at it tomorrow.” Then switch attention to a simple mental game (counting backwards, imagining a calm place) while breathing slowly.",
  },
  {
    id: 11,
    topic: "motivation",
    question: "How can I get started on tasks I keep avoiding?",
    answer:
      "Try the “first 2 minutes” rule: only commit to getting ready and doing the first 2 minutes of the task—opening the document, putting on your shoes, or laying out your books. Often once you start, doing a bit more feels easier. If not, you still succeeded at breaking the avoidance loop.",
  },
  {
    id: 12,
    topic: "routine",
    question: "How can I track my mood to see patterns?",
    answer:
      "Once per day, rate your mood from 1–10 and add 1–2 words about your day (like “exam”, “family time”, or “little sleep”). After a week, look for links: low scores after certain habits, or better scores after rest and connection. These patterns help you decide what to change gently.",
  },
];

// Filter chips
const TOPIC_FILTERS: { key: TopicKey; label: string; emoji: string }[] = [
  { key: "anxiety", label: "Anxiety & Worry", emoji: "💭" },
  { key: "low_mood", label: "Sad / Low", emoji: "💙" },
  { key: "stress", label: "Stress & Load", emoji: "📚" },
  { key: "sleep", label: "Sleep", emoji: "🌙" },
  { key: "motivation", label: "Motivation", emoji: "⚡" },
  { key: "routine", label: "Daily Routine", emoji: "📅" },
];

const ChatPage: React.FC = () => {
  const navigate = useNavigate();

  const BLUE = "#6BA7E6";
  const CREAM = "#f5e9d9";

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi, I'm your Mendly companion. Tell me how you're feeling today, or tap one of the ideas below to get started 💬",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // filters + suggestions
  const [selectedTopic, setSelectedTopic] = useState<TopicKey | null>(null);
  const [currentSuggestions, setCurrentSuggestions] = useState<SuggestionQA[]>(
    () => SUGGESTED_QA.slice(0, 3)
  );
  const [showSuggestions, setShowSuggestions] = useState(true);

  // horizontal scroll ref
  const filtersContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollFilters = (dir: "left" | "right") => {
    const el = filtersContainerRef.current;
    if (!el) return;
    const amount = 150;
    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  // Helper that re-picks 3 suggestions based on current or given topic
  const shuffleSuggestions = (topicOverride?: TopicKey | null) => {
    const topic = topicOverride !== undefined ? topicOverride : selectedTopic;
    const pool = SUGGESTED_QA.filter((qa) =>
      topic ? qa.topic === topic : true
    );
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setCurrentSuggestions(shuffled.slice(0, 3));
  };

  const handleFilterToggle = (key: TopicKey) => {
    setSelectedTopic((prev) => {
      const next = prev === key ? null : key; // toggle on/off
      shuffleSuggestions(next);
      return next;
    });
  };

  // User taps a suggestion
  const handleSuggestionClick = (qa: SuggestionQA) => {
    if (sending) return;
    setError(null);

    setMessages((prev) => [...prev, { role: "user", content: qa.question }]);
    setShowSuggestions(false);
    setSending(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: qa.answer },
      ]);
      shuffleSuggestions();
      setSending(false);
      setShowSuggestions(true);
    }, 900);
  };

  // User types custom text
  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setShowSuggestions(false);
    setSending(true);

    setTimeout(() => {
      const reply =
        "Thank you for sharing 🌱. Right now I can help you best if you choose from the ideas below. Pick the question that feels closest to what you need and I’ll guide you step by step.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply },
      ]);
      shuffleSuggestions();
      setSending(false);
      setShowSuggestions(true);
    }, 900);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
    position: "relative",
    height: 50,
    justifyContent: "space-between",
  };

  const titleBlockStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    alignItems: "center",
  };

  const appRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
  };

  const smallLabelStyle: React.CSSProperties = {
    color: "#5F8DD0",
    fontSize: 14,
    fontWeight: 600,
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
    width: "130%",
    height: "130%",
    objectFit: "cover",
  };

  const headerTitleStyle: React.CSSProperties = {
    fontFamily: '"Times New Roman", Georgia, serif',
    fontSize: 24,
    color: "#5F8DD0",
  };

  const backButtonStyle: React.CSSProperties = {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 22,
    color: "#5F8DD0",
  };

  const bottomSectionStyle: React.CSSProperties = {
    flex: 1,
    backgroundColor: BLUE,
    padding: "12px 16px 16px 16px",
    display: "flex",
    flexDirection: "column",
    color: "white",
    boxSizing: "border-box",
    overflowY: "auto",
  };

  const chatAreaStyle: React.CSSProperties = {
    flex: 1,
    padding: "4px 4px 8px 4px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  };

  const bubbleRowUser: React.CSSProperties = {
    display: "flex",
    justifyContent: "flex-end",
  };

  const bubbleRowAssistant: React.CSSProperties = {
    display: "flex",
    justifyContent: "flex-start",
  };

  const bubbleUser: React.CSSProperties = {
    maxWidth: "75%",
    padding: "10px 14px",
    borderRadius: 18,
    backgroundColor: "#FDE2F1",
    color: "#111827",
    fontSize: 14,
  };

  const bubbleAssistant: React.CSSProperties = {
    maxWidth: "80%",
    padding: "10px 14px",
    borderRadius: 18,
    backgroundColor: CREAM,
    color: "#111827",
    fontSize: 14,
  };

  const thinkingBubble: React.CSSProperties = {
    maxWidth: "45%",
    padding: "8px 12px",
    borderRadius: 18,
    backgroundColor: CREAM,
    color: "#6B7280",
    fontSize: 13,
  };

  const suggestionsCard: React.CSSProperties = {
    marginTop: 6,
    backgroundColor: CREAM,
    borderRadius: 20,
    padding: "10px 10px 12px 10px",
    boxShadow: "0 10px 25px rgba(15,23,42,0.18)",
  };

  const suggestionsHeaderRow: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  };

  const suggestionsTitle: React.CSSProperties = {
    fontWeight: 800,
    color: "#111827",
    fontSize: 15,
  };

  const refreshButtonStyle: React.CSSProperties = {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 18,
    color: "#6B7280",
  };

  const suggestionButton: React.CSSProperties = {
    marginTop: 6,
    padding: "10px 12px",
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    border: "none",
    width: "100%",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    fontSize: 14,
    color: "#111827",
  };

  const ideaIcon: React.CSSProperties = {
    fontSize: 18,
  };

  const filtersRowStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    overflowX: "auto",
    paddingBottom: 4,
    whiteSpace: "nowrap",
  };

  const filtersOuterStyle: React.CSSProperties = {
    marginTop: 4,
    marginBottom: 6,
    display: "flex",
    alignItems: "center",
    gap: 6,
  };

  const scrollArrowStyle: React.CSSProperties = {
    borderRadius: "50%",
    border: "none",
    width: 26,
    height: 26,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    cursor: "pointer",
    backgroundColor: "#F4C58F",
    color: "#3565AF",
    boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
  };

  const filterChip = (active: boolean): React.CSSProperties => ({
    flexShrink: 0,
    borderRadius: 999,
    border: "none",
    padding: "6px 10px",
    fontSize: 13,
    fontWeight: 500,
    backgroundColor: active ? "#F4C58F" : "#F3F4F6",
    color: active ? "#3565AF" : "#374151",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    boxShadow: active ? "0 3px 8px rgba(0,0,0,0.16)" : "none",
  });

  const inputRowStyle: React.CSSProperties = {
    marginTop: 4,
    display: "flex",
    alignItems: "center",
    gap: 8,
    backgroundColor: CREAM,
    borderRadius: 999,
    padding: "6px 10px",
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 14,
    color: "#1F2933",
  };

  const sendButtonStyle: React.CSSProperties = {
    borderRadius: 999,
    border: "none",
    padding: "8px 18px",
    fontSize: 14,
    fontWeight: 600,
    backgroundColor: "#F4C58F",
    color: "#3565AF",
    cursor: "pointer",
    boxShadow: "0 3px 8px rgba(0,0,0,0.18)",
    whiteSpace: "nowrap",
  };

  const errorStyle: React.CSSProperties = {
    marginTop: 4,
    fontSize: 12,
    color: "#FDE2E1",
    textAlign: "center",
  };

  const dotsRow: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    marginLeft: 4,
  };

  const dotBase: React.CSSProperties = {
    width: 6,
    height: 6,
    borderRadius: "50%",
    backgroundColor: "#D1D5DB",
  };

  return (
    <div style={screenStyle}>
      <div style={phoneStyle}>
        <style>{`
          .filter-row {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .filter-row::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* HEADER */}
        <div style={topSectionStyle}>
          <button
            type="button"
            style={backButtonStyle}
            onClick={() => navigate("/journey")}
            aria-label="Back"
          >
            ×
          </button>

          <div style={titleBlockStyle}>
            <div style={appRowStyle}>
              <div style={tinyLogoStyle}>
                <img src={logo} alt="Mendly logo" style={tinyLogoImgStyle} />
              </div>
              <span style={smallLabelStyle}>Mendly App</span>
            </div>
            <span style={headerTitleStyle}>Chat with AI</span>
          </div>

          <div style={{ width: 28 }} /> {/* spacer */}
        </div>

        {/* BODY */}
        <div style={bottomSectionStyle}>
          <div style={chatAreaStyle}>
            {messages.map((m, idx) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={idx}
                  style={isUser ? bubbleRowUser : bubbleRowAssistant}
                >
                  <div style={isUser ? bubbleUser : bubbleAssistant}>
                    {m.content}
                  </div>
                </div>
              );
            })}

            {sending && (
              <div style={bubbleRowAssistant}>
                <div style={thinkingBubble}>
                  Thinking
                  <span style={dotsRow}>
                    <span style={dotBase} />
                    <span style={{ ...dotBase, backgroundColor: "#F9A8D4" }} />
                    <span style={{ ...dotBase, backgroundColor: "#F472B6" }} />
                  </span>
                </div>
              </div>
            )}

            {showSuggestions && (
              <div style={suggestionsCard}>
                <div style={suggestionsHeaderRow}>
                  <div style={suggestionsTitle}>You may want to know…</div>
                  <button
                    type="button"
                    style={refreshButtonStyle}
                    onClick={() => shuffleSuggestions()}
                    aria-label="Refresh suggestions"
                  >
                    ⟳
                  </button>
                </div>

                {currentSuggestions.map((qa) => (
                  <button
                    key={qa.id}
                    type="button"
                    style={suggestionButton}
                    onClick={() => handleSuggestionClick(qa)}
                  >
                    <span style={ideaIcon}>💡</span>
                    <span>{qa.question}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* FILTER CHIPS */}
          <div style={filtersOuterStyle}>
            <button
              type="button"
              style={scrollArrowStyle}
              onClick={() => scrollFilters("left")}
              aria-label="Scroll filters left"
            >
              ◀
            </button>

            <div
              className="filter-row"
              ref={filtersContainerRef}
              style={filtersRowStyle}
            >
              {TOPIC_FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  style={filterChip(selectedTopic === f.key)}
                  onClick={() => handleFilterToggle(f.key)}
                >
                  <span>{f.emoji}</span>
                  <span>{f.label}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              style={scrollArrowStyle}
              onClick={() => scrollFilters("right")}
              aria-label="Scroll filters right"
            >
              ▶
            </button>
          </div>

          {/* INPUT */}
          <div style={inputRowStyle}>
            <input
              style={inputStyle}
              placeholder="Enter your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="button"
              style={sendButtonStyle}
              onClick={handleSend}
              disabled={sending}
            >
              {sending ? "..." : "Send"}
            </button>
          </div>

          {error && <div style={errorStyle}>{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
