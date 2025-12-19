// react-app/src/api/auth.ts
import axios from "axios";

import { Capacitor } from "@capacitor/core";

const isNative = Capacitor.isNativePlatform?.() ?? false;

export const API_BASE = isNative
  ? "http://10.0.2.2:8000"               // Android / iOS app
  : (import.meta.env.VITE_API_URL ?? "http://localhost:8000");  // browser


// ============== SIGNUP ==============

export const signup = (data: {
  username: string;
  email: string;
  password: string;
  age?: number;
  gender?: number;
}) => axios.post(`${API_BASE}/auth/signup`, data);

export function signupPsychologist(data: any) {
  return axios.post("http://localhost:8000/auth/signup-psychologist", data);
}


// ============== LOGIN ==============

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  username: string;
  role: "regular" | "psychologist";
}


export async function login(payload: LoginRequest): Promise<TokenResponse> {
  const { data } = await axios.post<TokenResponse>(
    `${API_BASE}/auth/login`,
    payload
  );
  return data;
}

// ============== FORGOT PASSWORD (EMAIL + CODE) ==============

export const requestPasswordReset = (data: { email: string }) =>
  axios.post(`${API_BASE}/auth/forgot-password/start`, data);

export const verifyPasswordReset = (data: {
  email: string;
  code: string;
  new_password: string;
}) => axios.post(`${API_BASE}/auth/forgot-password/verify`, data);

// ============== PROFILE TYPES ==============

export interface UserProfile {
  user_id: string;
  username: string;
  email: string;
  age?: number | null;
  gender?: number | null; // 0=NA,1=F,2=M,3=Other
}

export interface UpdateProfilePayload {
  username: string;
  email: string;
  age?: number;
  gender?: number;
}

// ============== AUTH HEADER HELPER ==============

function buildAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("access_token") || "";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

// ============== PROFILE REQUESTS (using fetch) ==============

export async function getProfile(): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    method: "GET",
    headers: buildAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Failed to load profile: ${res.status}`);
  }
  return res.json();
}

export async function updateProfile(
  payload: UpdateProfilePayload
): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    method: "PUT",
    headers: buildAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to update profile: ${res.status}`);
  }
  return res.json();
}

// ============== CHANGE PASSWORD ==============

export async function changePassword(payload: {
  current_password: string;
  new_password: string;
}): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/change-password`, {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to change password: ${res.status}`);
  }
}

// ====== JOURNEY / STATS TYPES & API ======

export interface JourneyDay {
  date: string; // ISO date "YYYY-MM-DD"
  avg_score: number | null;
}

export interface JourneySettings {
  checkin_frequency: number;
  motivation_enabled: boolean;
}

export interface JourneyOverview {
  settings: {
    checkin_frequency?: number;
    motivation_enabled?: boolean;
  };
  last7days: JourneyDay[];
}

export async function getJourneyOverview(): Promise<JourneyOverview> {
  const res = await fetch(`${API_BASE}/journey/overview`, {
    method: "GET",
    headers: buildAuthHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to load journey overview: ${res.status}`);
  }

  return res.json();
}

// ========== AI CHAT ==========

export interface AiMessage {
  role: "user" | "assistant";
  content: string;
}

export async function sendChatToAI(messages: AiMessage[]): Promise<string> {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("Not authenticated");
  }

  const res = await fetch("http://localhost:8000/ai/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `AI request failed: ${res.status}`);
  }

  const json = await res.json();
  return json.reply as string;
}

// ---- CHECK-IN API ----

export async function submitMoodCheckin(payload: {
  score: number | null;
  label: string | null;
  note: string | null;
}): Promise<void> {
  const token = localStorage.getItem("access_token");
  const res = await fetch("http://localhost:8000/checkin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
}

export interface SeriesPoint {
  value: number;
  date: string;
  avg_score: number | null;
}

export async function getMoodSeries(days: number): Promise<SeriesPoint[]> {
  const res = await fetch(`${API_BASE}/journey/series?days=${days}`, {
    method: "GET",
    headers: buildAuthHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}


// ========== POSITIVE NOTIFICATIONS SETTINGS ==========

export interface PositiveNotificationSettings {
  enabled: boolean;
  frequency_minutes: number;
}

export async function getPositiveNotificationSettings(): Promise<PositiveNotificationSettings> {
  const res = await fetch(`${API_BASE}/positive-notifications/settings`, {
    method: "GET",
    headers: buildAuthHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to load positive notifications: ${res.status}`);
  }

  return res.json();
}

export async function updatePositiveNotificationSettings(
  payload: PositiveNotificationSettings
): Promise<PositiveNotificationSettings> {
  const res = await fetch(`${API_BASE}/positive-notifications/settings`, {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to update positive notifications: ${res.status}`);
  }

  return res.json();
}


export interface HappyMemory {
  memory_id: string;
  image_url: string;
  caption: string | null;
  memory_date: string | null;
  created_at: string;
}

export async function listHappyMemories(): Promise<HappyMemory[]> {
  const token = window.localStorage.getItem("access_token");
  if (!token) throw new Error("Not logged in");

  const res = await fetch(`${API_BASE}/photo-memories`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to load happy memories");
  }

  return res.json();
}

export async function uploadHappyMemory(
  file: File,
  caption?: string,
  memoryDate?: string
): Promise<void> {
  const token = window.localStorage.getItem("access_token");
  if (!token) throw new Error("Not logged in");

  const formData = new FormData();
  formData.append("file", file);
  if (caption) formData.append("caption", caption);
  if (memoryDate) formData.append("memory_date", memoryDate);

  const res = await fetch(`${API_BASE}/photo-memories/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to upload happy memory");
  }
}

export async function deleteHappyMemory(memoryId: string): Promise<void> {
  const token = window.localStorage.getItem("access_token");
  if (!token) throw new Error("Not logged in");

  const res = await fetch(`${API_BASE}/photo-memories/${memoryId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to delete happy memory");
  }
}

export interface WeeklyPhotoCandidate {
  show: boolean;
  memory?: {
    memory_id: string;
    image_url: string;
    caption: string | null;
    memory_date: string | null;
  };
  message?: string;
}

export async function getWeeklyPhotoCandidate(): Promise<WeeklyPhotoCandidate> {
  const token = window.localStorage.getItem("access_token");
  if (!token) throw new Error("Not logged in");

  const res = await fetch(`${API_BASE}/photo-memories/weekly-candidate`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to load weekly photo candidate");
  }
  return res.json();
}
