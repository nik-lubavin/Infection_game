const COOKIE_NAME = 'virus_game_player_session';
const PLAYER_ID_COOKIE = 'virus_game_player_id';
const SESSION_PATTERN = /^[A-Z]{3}\d$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 365;

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, maxAgeSec: number): void {
  if (typeof document === 'undefined') return;
  const enc = encodeURIComponent(value);
  document.cookie = `${name}=${enc};path=/;max-age=${maxAgeSec};SameSite=Lax`;
}

export function generateSessionName(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let s = '';
  for (let i = 0; i < 3; i++) {
    s += letters[Math.floor(Math.random() * letters.length)];
  }
  s += Math.floor(Math.random() * 10).toString();
  return s;
}

function generatePlayerId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getOrCreatePlayerId(): string {
  const existing = readCookie(PLAYER_ID_COOKIE);
  if (existing && UUID_PATTERN.test(existing)) {
    return existing;
  }
  const id = generatePlayerId();
  writeCookie(PLAYER_ID_COOKIE, id, COOKIE_MAX_AGE_SEC);
  return id;
}

export function getOrCreateSessionName(): string {
  const existing = readCookie(COOKIE_NAME);
  if (existing && SESSION_PATTERN.test(existing)) {
    getOrCreatePlayerId();
    return existing;
  }
  const name = generateSessionName();
  writeCookie(COOKIE_NAME, name, COOKIE_MAX_AGE_SEC);
  getOrCreatePlayerId();
  return name;
}

export function getOrCreatePlayerSession(): { name: string; playerId: string } {
  return {
    name: getOrCreateSessionName(),
    playerId: getOrCreatePlayerId(),
  };
}
