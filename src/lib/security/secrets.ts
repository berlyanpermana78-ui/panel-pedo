import { ProjectFile } from '../../types';

// Regular expressions to identify sensitive tokens and secrets
const SECRET_PATTERNS = [
  /sk-[a-zA-Z0-9]{20,}/g, // OpenAI/General sk- keys
  /AIza[0-9A-Za-z-_]{35}/g, // Google API keys
  /ghp_[a-zA-Z0-9]{36}/g, // GitHub personal tokens
  /gho_[a-zA-Z0-9]{36}/g, // GitHub OAuth tokens
  /xox[baprs]-[0-9a-zA-Z]{10,48}/g, // Slack tokens
  /bearer\s+[a-zA-Z0-9\-._~+/]+=*/gi, // Bearer auth headers
  /(password|secret|api_key|token|auth_token|access_token|private_key)\s*[:=]\s*["']?([^"'\s\n\r]+)["']?/gi,
  /-----BEGIN\s+PRIVATE\s+KEY-----[\s\S]*?-----END\s+PRIVATE\s+KEY-----/gi,
];

/**
 * Sanitizes any raw text by masking suspected API keys, passwords, and tokens.
 */
export function sanitizeSecrets(text: string): string {
  if (!text || typeof text !== 'string') return '';
  let sanitized = text;

  // Mask generic regex patterns
  for (const pattern of SECRET_PATTERNS) {
    sanitized = sanitized.replace(pattern, (match, p1, p2) => {
      if (p1 && p2) {
        return `${p1}=***REDACTED_SECRET***`;
      }
      return '***REDACTED_SECRET***';
    });
  }

  // Extra line-by-line check for .env style assignments
  sanitized = sanitized
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (
        /^(SECRET|API_KEY|TOKEN|PASSWORD|PRIVATE_KEY|AUTH|DATABASE_URL|DATABASE_PASSWORD)=/i.test(
          trimmed
        )
      ) {
        const parts = line.split('=');
        return `${parts[0]}=***REDACTED_SECRET***`;
      }
      return line;
    })
    .join('\n');

  return sanitized;
}

/**
 * Determines whether a file path or name is a secret/environment file that should not be exported or sent.
 */
export function isSecretFile(filename: string): boolean {
  const lower = filename.toLowerCase().trim();
  const basename = lower.split('/').pop() || lower;

  return (
    basename === '.env' ||
    basename === '.env.local' ||
    basename === '.env.production' ||
    basename === '.env.development' ||
    basename.startsWith('.env.') ||
    basename.endsWith('.pem') ||
    basename.endsWith('.key') ||
    basename.endsWith('.cert') ||
    basename === 'id_rsa' ||
    basename === 'id_ed25519'
  );
}

/**
 * Strips or masks secret files from a list of project files.
 */
export function filterSafeFiles(files: ProjectFile[], allowEnv = false): ProjectFile[] {
  return files.filter((f) => {
    if (!allowEnv && isSecretFile(f.name)) {
      return false;
    }
    return true;
  });
}
