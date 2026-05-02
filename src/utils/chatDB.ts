/**
 * Chat persistence using RNSecureStorage (already installed, no rebuild needed).
 * Stores:
 *   __chat_sessions       → JSON array of ChatSession[]
 *   __chat_messages_{id}  → JSON array of ChatMessage[] per session
 */
import RNSecureStorage, { ACCESSIBLE } from "killuhwhal3-rn-secure-storage";

const OPTS = { accessible: ACCESSIBLE.WHEN_UNLOCKED };

// ── User-scoped storage keys ─────────────────────────────────────────────────
let _userEmail = "";
export const setChatDBUser = (email: string) => { _userEmail = email; };
const userKey = (base: string) => _userEmail ? `${base}::${_userEmail}` : base;

const SESSIONS_KEY = "__chat_sessions";
const messagesKey = (sessionId: string) => userKey(`__chat_messages_${sessionId}`);

// ── Types ─────────────────────────────────────────────────────────────────────

export type ChatSession = {
  id: string;
  title: string;
  coach_type: string;
  created_at: number;
  updated_at: number;
  // Denormalized for fast list rendering. Updated by insertMessage.
  // Optional so old sessions (pre-field) don't break; hydrated lazily in
  // getAllSessions for any session missing message_count.
  last_message_preview?: string;
  message_count?: number;
};

export type ChatMessage = {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: number;
};

const PREVIEW_MAX_CHARS = 160;
const truncatePreview = (s: string) =>
  s.length > PREVIEW_MAX_CHARS ? s.slice(0, PREVIEW_MAX_CHARS - 1) + "…" : s;

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
  const sessions = await readJSON<ChatSession[]>(userKey(SESSIONS_KEY), []);

  // One-time hydration for sessions that predate preview/count fields.
  // After this runs once, all sessions have the fields and the check is cheap.
  const needsHydrate = sessions.some((s) => s.message_count === undefined);
  if (needsHydrate) {
    const hydrated = await Promise.all(
      sessions.map(async (s) => {
        if (s.message_count !== undefined) return s;
        const msgs = await readJSON<ChatMessage[]>(messagesKey(s.id), []);
        const last = msgs[msgs.length - 1];
        return {
          ...s,
          message_count: msgs.length,
          last_message_preview: last ? truncatePreview(last.content) : "",
        };
      })
    );
    await writeJSON(userKey(SESSIONS_KEY), hydrated);
    return hydrated.sort((a, b) => b.updated_at - a.updated_at);
  }

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
  const sessions = await readJSON<ChatSession[]>(userKey(SESSIONS_KEY), []);
  await writeJSON(userKey(SESSIONS_KEY), [session, ...sessions]);
  return session;
};

export const updateSessionTitle = async (
  sessionId: string,
  title: string
): Promise<void> => {
  const sessions = await readJSON<ChatSession[]>(userKey(SESSIONS_KEY), []);
  const updated = sessions.map((s) =>
    s.id === sessionId ? { ...s, title, updated_at: Date.now() } : s
  );
  await writeJSON(userKey(SESSIONS_KEY), updated);
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  const sessions = await readJSON<ChatSession[]>(userKey(SESSIONS_KEY), []);
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
  const next = [...msgs, msg];
  await writeJSON(messagesKey(msg.session_id), next);

  // Denormalize latest preview + count + updated_at onto the session so the
  // history screen can render without loading each session's messages.
  const sessions = await readJSON<ChatSession[]>(userKey(SESSIONS_KEY), []);
  const updated = sessions.map((s) =>
    s.id === msg.session_id
      ? {
          ...s,
          last_message_preview: truncatePreview(msg.content),
          message_count: next.length,
          updated_at: Date.now(),
        }
      : s
  );
  await writeJSON(userKey(SESSIONS_KEY), updated);
};
