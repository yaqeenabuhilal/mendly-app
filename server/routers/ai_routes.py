# server/routers/ai_routes.py

from typing import List, Literal
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from sqlalchemy.orm import Session
from sqlalchemy import text

from ..deps import get_db
from ..auth import get_current_user
from ..models import User

router = APIRouter(prefix="/ai", tags=["ai-chat"])

# ============================
# Request / Response models
# ============================

class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    reply: str

# ============================
# Emotion & scoring helpers
# ============================

def normalize(s: str) -> str:
    return (s or "").strip().lower()

def estimate_mood_score(text: str) -> int:
    """
    Super basic sentiment → score (0..10).
    You can refine later; this is good enough to feed the Journey page.
    """
    lower = normalize(text)
    score = 5  # neutral baseline

    # strong positive first
    if any(w in lower for w in ["very happy", "amazing", "fantastic", "wonderful", "ecstatic"]):
        score = 9
    elif any(w in lower for w in ["happy", "good", "great", "excited", "grateful", "proud"]):
        score = 7
    # strong negatives
    elif any(w in lower for w in ["depressed", "terrible", "awful", "hopeless", "miserable"]):
        score = 1
    elif any(w in lower for w in ["angry", "furious", "mad", "rage", "frustrated"]):
        score = 2
    elif any(w in lower for w in ["anxious", "anxiety", "worried", "panic", "stressed", "overwhelmed"]):
        score = 4
    elif any(w in lower for w in ["sad", "down", "unhappy", "low", "lonely"]):
        score = 3
    elif any(w in lower for w in ["tired", "exhausted", "burnt out", "burned out", "fatigued"]):
        score = 4
    elif any(w in lower for w in ["sick", "ill", "fever", "pain", "hurts"]):
        score = 3
    elif any(w in lower for w in ["bored", "meh", "nothing to do"]):
        score = 5
    elif any(w in lower for w in ["confused", "lost", "don’t know", "don't know"]):
        score = 4

    return max(0, min(10, score))

def mood_label_from_score(score: int) -> str:
    if score >= 8:
        return "Very positive"
    if score >= 6:
        return "Positive"
    if score >= 4:
        return "Neutral / mixed"
    if score >= 2:
        return "Low / sad"
    return "Very low"

def pick_motivation_for_text(text: str) -> str:
    """
    A tiny library of supportive, actionable, *very short* tips
    tailored to the user's likely state.
    """
    lower = normalize(text)

    if any(w in lower for w in ["angry", "furious", "mad", "frustrated"]):
        return "Try a 90-second reset: slow inhale 4s, hold 4s, long exhale 6–8s. Shake out the shoulders."
    if any(w in lower for w in ["anxious", "anxiety", "worried", "panic", "stressed", "overwhelmed"]):
        return "Grounding tip: name 5 things you can see, 4 you can feel, 3 you can hear, 2 you can smell, 1 you can taste."
    if any(w in lower for w in ["sad", "down", "unhappy", "low", "lonely"]):
        return "Tiny lift: step outside for 2 minutes of fresh air or light; message someone you trust one sentence."
    if any(w in lower for w in ["tired", "exhausted", "burnt out", "burned out", "fatigued"]):
        return "Micro-recharge: 20-minute break with phone away, drink water, blink slowly 10 times."
    if any(w in lower for w in ["sick", "ill", "fever", "pain", "hurts"]):
        return "Be gentle today—hydrate, rest if you can, and consider a quick check-in with a clinician if symptoms persist."
    if any(w in lower for w in ["bored", "meh"]):
        return "Pick a 10-minute task with a clear finish—then reward yourself. Momentum beats motivation."
    if any(w in lower for w in ["confused", "lost"]):
        return "Write 3 bullet points: what you know, what you don’t, and one next step."
    if any(w in lower for w in ["proud", "grateful", "happy", "excited", "great", "good"]):
        return "Awesome—savor this! Take a breath and note one specific detail you appreciate right now."

    return "Small steps count. Pick one doable action for the next 10 minutes—then come back and we’ll reflect."

# ============================
# Empathetic “local AI” reply
# ============================

def generate_reply(message: str, history: List[ChatMessage]) -> str:
    """
    Rule-based reply with an empathetic core and a short, tailored
    motivation tip appended. No external APIs required.
    """
    text_in = message.strip()
    lower = normalize(text_in)

    # Avoid repeating the exact last assistant message verbatim
    last_assistant = next((m.content for m in reversed(history) if m.role == "assistant"), "")

    # Core empathy block
    if any(w in lower for w in ["sad", "down", "depressed", "low", "lonely"]):
        base = (
            "I'm really sorry you're feeling low. It's okay to have days like this. "
            "Do you want to share what made today feel heavy?"
        )
    elif any(w in lower for w in ["anxious", "anxiety", "worried", "nervous", "stressed", "overwhelmed"]):
        base = (
            "Anxiety and stress can feel intense. Let’s slow things down for a moment. "
            "What thought or situation is most in front of you right now?"
        )
    elif any(w in lower for w in ["angry", "mad", "frustrated", "furious"]):
        base = (
            "It sounds like you're really frustrated or angry. Those feelings are valid. "
            "What happened just before the anger showed up?"
        )
    elif any(w in lower for w in ["tired", "exhausted", "burnt out", "burned out", "fatigued"]):
        base = (
            "You sound drained. Fatigue can make everything feel harder. "
            "Is it mental load, lack of sleep, or something specific today?"
        )
    elif any(w in lower for w in ["sick", "ill", "fever", "pain", "hurts"]):
        base = (
            "Not feeling well is rough. How are your symptoms right now, and do you have support if you need it?"
        )
    elif any(w in lower for w in ["confused", "lost", "stuck"]):
        base = (
            "Feeling stuck or confused is normal when things are complex. "
            "Tell me the goal in one sentence—then we’ll map a next step."
        )
    elif any(w in lower for w in ["bored", "meh", "nothing to do"]):
        base = (
            "Boredom can hide behind low energy. What’s one tiny, doable activity you wouldn’t hate for 10 minutes?"
        )
    elif any(w in lower for w in ["proud", "grateful", "happy", "good", "great", "excited"]):
        base = (
            "I love hearing that. What exactly made you feel this way? Let’s highlight it so you can revisit it later."
        )
    elif "thank" in lower:
        base = (
            "You're welcome—I'm here anytime. Is there anything else you want to explore right now?"
        )
    elif any(w in lower for w in ["help", "advice", "tips", "tip"]):
        base = (
            "I’ll do my best to help. Can you describe the situation in a few bullet points so we can get specific?"
        )
    else:
        base = (
            "Thank you for sharing. I’m here to listen and support you without judgment. "
            "What feels most important to talk about next?"
        )

    # Motivation tip
    tip = pick_motivation_for_text(text_in)
    reply = f"{base}\n\n💡 Tip: {tip}"

    if last_assistant and last_assistant.strip() == reply.strip():
        reply += "\n\nIf you’d like, we can try a different angle—what outcome would feel 10% better?"

    return reply

# ============================
# FastAPI route
# ============================

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    req: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ChatResponse:
    """
    1) Build a bounded 'recent history' (so chats can go on indefinitely).
    2) Generate an empathetic reply with a tailored motivation tip.
    3) Estimate mood & save a MoodEntries record (checkin_slot=NULL).
    """

    # ---- 1) Bound history length to keep requests light (unlimited turns over time)
    # Keep only the last 30 turns total (user+assistant)
    bounded_history = req.history[-30:] if req.history else []

    # ---- 2) Generate reply
    try:
        reply = generate_reply(req.message, bounded_history)
    except Exception as e:
        print("[AI] local generate_reply error:", e)
        raise HTTPException(status_code=500, detail="Local AI error. Please try again.")

    # ---- 3) Save mood snapshot based on the most recent user text (last ~10 user msgs)
    try:
        user_texts = [m.content for m in bounded_history if m.role == "user"]
        user_texts.append(req.message)
        # Save only the most recent ~10 user messages as the "note"
        recent_user_note = "\n".join(user_texts[-10:]).strip()

        if recent_user_note:
            mood_score = estimate_mood_score(recent_user_note)
            label = mood_label_from_score(mood_score)

            db.execute(
                text(
                    """
                    INSERT INTO dbo.MoodEntries
                        (user_id, checkin_slot, score, label,
                         text_note_encrypted, emojis_json,
                         captured_at, created_at)
                    VALUES
                        (
                            :uid,
                            :slot,
                            :score,
                            :label,
                            CONVERT(VARBINARY(MAX), :note),
                            :emojis,
                            SYSDATETIMEOFFSET(),
                            SYSDATETIMEOFFSET()
                        )
                    """
                ),
                {
                    "uid": current_user.user_id,
                    "slot": None,         # NULL to satisfy your CHECK constraint
                    "score": mood_score,
                    "label": label,
                    "note": recent_user_note,
                    "emojis": None,
                },
            )
            db.commit()
    except Exception as e:
        # Never block the chat if saving fails
        print("[AI] Failed to save mood entry from AI chat:", e)

    return ChatResponse(reply=reply)
