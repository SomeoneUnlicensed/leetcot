export const LENTA_CHAMPIONSHIP_SLUG = 'lenta-debug-simulator';

/** Collapses whitespace so "  Иван   Иванов " and "Иван Иванов" are the same login key. */
export function normalizeParticipantName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}
