/**
 * Validates and sanitizes paths to prevent path traversal vulnerabilities.
 */

export function sanitizePath(rawPath: string): string {
  if (!rawPath || typeof rawPath !== 'string') return 'file.txt';

  // Normalize slashes
  let sanitized = rawPath.replace(/\\/g, '/');

  // Strip null bytes and control chars
  sanitized = sanitized.replace(/\0/g, '');

  // Split and remove harmful segments (., .., empty)
  const segments = sanitized.split('/').filter((seg) => {
    const s = seg.trim();
    return s !== '' && s !== '.' && s !== '..';
  });

  if (segments.length === 0) {
    return 'file.txt';
  }

  // Prevent leading drive letters (e.g. C:)
  const first = segments[0];
  if (/^[a-zA-Z]:$/.test(first)) {
    segments.shift();
  }

  return segments.join('/');
}

export function isSafePath(rawPath: string): boolean {
  if (!rawPath || typeof rawPath !== 'string') return false;
  if (rawPath.includes('..') || rawPath.includes('\0')) return false;
  if (rawPath.startsWith('/') || /^[a-zA-Z]:/.test(rawPath)) return false;
  return true;
}
