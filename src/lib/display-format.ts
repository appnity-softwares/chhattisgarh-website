export const EMPTY_DISPLAY_VALUE = "-";

const dobFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export function hasDisplayValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return false;
    return !["-", "n/a", "na", "null", "undefined"].includes(trimmed.toLowerCase());
  }
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export function displayValue(value: unknown, fallback = EMPTY_DISPLAY_VALUE): string {
  if (!hasDisplayValue(value)) return fallback;
  if (typeof value === "string") return value.trim();
  return String(value);
}

export function formatDateOfBirth(value: unknown): string {
  if (value === null || value === undefined || value === "") return EMPTY_DISPLAY_VALUE;

  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return EMPTY_DISPLAY_VALUE;

  return dobFormatter.format(date);
}

export function calculateAge(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;

  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age--;
  }

  return age >= 0 ? age : null;
}

export function formatProfileName(profile: {
  firstName?: string | null;
  lastName?: string | null;
  profileId?: string | number | null;
  id?: string | number | null;
}): string {
  const name = [profile.firstName, profile.lastName]
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean)
    .join(" ");

  if (name) return name;
  if (profile.profileId) return String(profile.profileId);
  if (profile.id) return `Profile ${profile.id}`;
  return "Profile";
}

export function formatEnumLabel(value: unknown): string {
  const displayed = displayValue(value);
  if (displayed === EMPTY_DISPLAY_VALUE) return displayed;

  return displayed
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
