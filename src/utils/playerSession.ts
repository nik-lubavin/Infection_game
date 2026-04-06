const COOKIE_NAME = "virus_game_player_session";
const SESSION_PATTERN = /^[A-Z]{3}\d$/;
const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 365;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, maxAgeSec: number): void {
  if (typeof document === "undefined") return;
  const enc = encodeURIComponent(value);
  document.cookie = `${name}=${enc};path=/;max-age=${maxAgeSec};SameSite=Lax`;
}

export function generateSessionName(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let s = "";
  for (let i = 0; i < 3; i++) {
    s += letters[Math.floor(Math.random() * letters.length)];
  }
  s += Math.floor(Math.random() * 10).toString();
  return s;
}

export function getOrCreateSessionName(): string {
  const existing = readCookie(COOKIE_NAME);
  if (existing && SESSION_PATTERN.test(existing)) {
    return existing;
  }
  const name = generateSessionName();
  writeCookie(COOKIE_NAME, name, COOKIE_MAX_AGE_SEC);
  return name;
}
