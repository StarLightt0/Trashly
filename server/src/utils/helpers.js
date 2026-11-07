/**
 * Safely parse a JSON string or return fallback if already an array/object or invalid string.
 * Prevents JSON.parse() from ever crashing an endpoint.
 */
export function safeParseJson(value, fallback = []) {
  if (value === null || value === undefined) return fallback;
  if (Array.isArray(value)) return value;
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return fallback;

  const trimmed = value.trim();
  if (!trimmed) return fallback;

  try {
    return JSON.parse(trimmed);
  } catch (err) {
    // If it's a newline or comma separated list, split it
    if (trimmed.includes('\n')) {
      return trimmed.split('\n').map(s => s.trim().replace(/^[-*•\d.)\s]+/, '')).filter(Boolean);
    }
    if (trimmed.includes(',')) {
      return trimmed.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [trimmed];
  }
}
