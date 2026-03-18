/**
 * Chat persistence using RNSecureStorage (already installed, no rebuild needed).
 * Stores:
 *   __chat_sessions       → JSON array of ChatSession[]
 *   __chat_messages_{id}  → JSON array of ChatMessage[] per session
 */
import RNSecureStorage, { ACCESSIBLE } from "killuhwhal3-rn-secure-storage";

const OPTS = { accessible: ACCESSIBLE.WHEN_UNLOCKED };
const SESSIONS_KEY = "__chat_sessions";
const messagesKey = (sessionId: string) => `__chat_messages_${sessionId}`;

// ── Types ─────────────────────────────────────────────────────────────────────

export type ChatSession = {
  id: string;
  title: string;
  coach_type: string;
  created_at: number;
  updated_at: number;
};

export type ChatMessage = {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: number;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const readJSON = async <T>(key: string, fallback: T): Promise<T> => {
  try {
    const raw = await RNSecureStorage.get(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJSON = async (key: string, value: unknown): Promise<void> => {
  await RNSecureStorage.set(key, JSON.stringify(value), OPTS);
};

// ── No-op — kept so callers don't need changes ────────────────────────────────
export function initChatDB() {}

// ── Sessions ──────────────────────────────────────────────────────────────────

export const getAllSessions = async (): Promise<ChatSession[]> => {
  const sessions = await readJSON<ChatSession[]>(SESSIONS_KEY, []);
  return sessions.sort((a, b) => b.updated_at - a.updated_at);
};

export const createSession = async (
  id: string,
  title: string,
  coachType: string
): Promise<ChatSession> => {
  const now = Date.now();
  const session: ChatSession = {
    id,
    title,
    coach_type: coachType,
    created_at: now,
    updated_at: now,
  };
  const sessions = await readJSON<ChatSession[]>(SESSIONS_KEY, []);
  await writeJSON(SESSIONS_KEY, [session, ...sessions]);
  return session;
};

export const updateSessionTitle = async (
  sessionId: string,
  title: string
): Promise<void> => {
  const sessions = await readJSON<ChatSession[]>(SESSIONS_KEY, []);
  const updated = sessions.map((s) =>
    s.id === sessionId ? { ...s, title, updated_at: Date.now() } : s
  );
  await writeJSON(SESSIONS_KEY, updated);
};

export const touchSession = async (sessionId: string): Promise<void> => {
  const sessions = await readJSON<ChatSession[]>(SESSIONS_KEY, []);
  const updated = sessions.map((s) =>
    s.id === sessionId ? { ...s, updated_at: Date.now() } : s
  );
  await writeJSON(SESSIONS_KEY, updated);
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  const sessions = await readJSON<ChatSession[]>(SESSIONS_KEY, []);
  await writeJSON(
    SESSIONS_KEY,
    sessions.filter((s) => s.id !== sessionId)
  );
  try {
    await RNSecureStorage.remove(messagesKey(sessionId));
  } catch {}
};

// ── Messages ──────────────────────────────────────────────────────────────────

export const getMessages = async (sessionId: string): Promise<ChatMessage[]> => {
  return readJSON<ChatMessage[]>(messagesKey(sessionId), []);
};

export const insertMessage = async (msg: ChatMessage): Promise<void> => {
  const msgs = await readJSON<ChatMessage[]>(messagesKey(msg.session_id), []);
  await writeJSON(messagesKey(msg.session_id), [...msgs, msg]);
};
