import RNSecureStorage, { ACCESSIBLE } from "killuhwhal3-rn-secure-storage";

// ── User-scoped storage keys ─────────────────────────────────────────────────
let _userEmail = "";
export const setCoachStorageUser = (email: string) => { _userEmail = email; };
const userKey = (base: string) => _userEmail ? `${base}::${_userEmail}` : base;

const COACH_PROFILE_KEY = "__coach_profile";
const COACH_MEMORY_KEY  = "__coach_memory";

export type CoachProfile = {
  coachType: string;
  goals: string[];              // up to 3 selected goals
  fitnessInfo: string;          // single selected fitness profile
  excludedExercises: string[];  // exercise names to avoid
  completedOnboarding: boolean;
};

export const COACH_TYPES = [
  "Strength & Conditioning Coach",
  "Bodybuilding Coach",
  "Athletic Performance Coach",
  "Fat Loss & Conditioning Coach",
  "Functional Fitness Coach",
  "Endurance & Cardio Coach",
  "Mobility & Recovery Coach",
];

export const FITNESS_GOALS = [
  "Build Strength",
  "Gain Muscle",
  "Lose Fat",
  "Athletic Performance",
  "Increase Endurance",
  "Improve Mobility",
  "General Health",
];

export const FITNESS_PROFILES = [
  "Beginner — Just Getting Started",
  "Beginner into Bodybuilding",
  "Intermediate — Training 1-2 Years",
  "Intermediate into Strength Sports",
  "Advanced Lifter — 3+ Years",
  "Competitive Athlete",
  "Functional Fitness / CrossFit",
  "Active Senior (50+) — Low Impact",
];

export const saveCoachProfile = async (
  profile: CoachProfile
): Promise<boolean> => {
  try {
    await RNSecureStorage.set(
      userKey(COACH_PROFILE_KEY),
      JSON.stringify(profile),
      { accessible: ACCESSIBLE.WHEN_UNLOCKED }
    );
    return true;
  } catch (e) {
    console.log("Error saving coach profile:", e);
    return false;
  }
};

export const getCoachProfile = async (): Promise<CoachProfile | null> => {
  try {
    const raw = await RNSecureStorage.get(userKey(COACH_PROFILE_KEY));
    if (!raw) return null;
    return JSON.parse(raw) as CoachProfile;
  } catch (e) {
    console.log("Error reading coach profile:", e);
    return null;
  }
};

export const clearCoachProfile = async (): Promise<boolean> => {
  try {
    await RNSecureStorage.remove(userKey(COACH_PROFILE_KEY));
    return true;
  } catch (e) {
    console.log("Error clearing coach profile:", e);
    return false;
  }
};

// ── Coach Memory ──────────────────────────────────────────────────────────────

/**
 * Long-term memory extracted from chat conversations.
 * Persisted on-device; merged (never fully overwritten) so older facts survive.
 */
export type CoachMemory = {
  height?:            string;   // e.g. "5'7\""
  weight?:            string;   // e.g. "185 lbs"
  diet?:              string;   // e.g. "mostly carnivore, avoids dairy"
  health_conditions?: string;   // e.g. "bad left knee, no overhead pressing"
  equipment?:         string;   // e.g. "home gym – barbell, dumbbells, pull-up bar"
  schedule?:          string;   // e.g. "trains 4× per week, evenings"
  notes?:             string;   // any other relevant observations
  last_updated?:      number;   // epoch ms
};

export const getCoachMemory = async (): Promise<CoachMemory | null> => {
  try {
    const raw = await RNSecureStorage.get(userKey(COACH_MEMORY_KEY));
    return raw ? (JSON.parse(raw) as CoachMemory) : null;
  } catch {
    return null;
  }
};

export const saveCoachMemory = async (memory: CoachMemory): Promise<void> => {
  try {
    await RNSecureStorage.set(
      userKey(COACH_MEMORY_KEY),
      JSON.stringify(memory),
      { accessible: ACCESSIBLE.WHEN_UNLOCKED }
    );
  } catch (e) {
    console.log("Error saving coach memory:", e);
  }
};

/**
 * Merges a partial update (from the AI response) into the stored memory.
 * Existing fields are preserved; only truthy new values overwrite them.
 */
export const mergeCoachMemory = async (
  update: Partial<CoachMemory>
): Promise<void> => {
  const existing = (await getCoachMemory()) ?? {};
  const merged: CoachMemory = {
    ...existing,
    ...Object.fromEntries(
      Object.entries(update).filter(([, v]) => typeof v === "string" && v.trim().length > 0)
    ),
    last_updated: Date.now(),
  };
  await saveCoachMemory(merged);
};

/**
 * Converts stored memory into a human-readable context string for the AI system prompt.
 * Returns an empty string if there is no memory.
 */
export const buildMemoryContext = (memory: CoachMemory | null): string => {
  if (!memory) return "";
  const lines: string[] = [];
  if (memory.height)            lines.push(`Height: ${memory.height}`);
  if (memory.weight)            lines.push(`Weight: ${memory.weight}`);
  if (memory.diet)              lines.push(`Diet: ${memory.diet}`);
  if (memory.health_conditions) lines.push(`Health notes: ${memory.health_conditions}`);
  if (memory.equipment)         lines.push(`Equipment: ${memory.equipment}`);
  if (memory.schedule)          lines.push(`Training schedule: ${memory.schedule}`);
  if (memory.notes)             lines.push(`Notes: ${memory.notes}`);
  return lines.join("\n");
};

export const clearCoachMemory = async (): Promise<void> => {
  try {
    await RNSecureStorage.remove(userKey(COACH_MEMORY_KEY));
  } catch {}
};

// ── Workout prompt builder ────────────────────────────────────────────────────

/** Builds the prompt context string injected into AI workout generation */
export const buildCoachPrompt = (profile: CoachProfile): string => {
  const lines = [
    `Coach type: ${profile.coachType}`,
    `Goals: ${profile.goals.join(", ")}`,
    `Fitness background: ${profile.fitnessInfo}`,
  ];
  if (profile.excludedExercises?.length > 0) {
    lines.push(
      `Excluded exercises (do NOT include these): ${profile.excludedExercises.join(", ")}`
    );
  }
  lines.push(
    `Generate my next workout. Program it the way a real ${profile.coachType} would — ` +
    `tailored to my goals, background, and any constraints above.`
  );
  return lines.join("\n");
};
