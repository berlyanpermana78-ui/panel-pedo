import { UserBugReport, Project, ExecutionState } from '../../types';
import { sanitizeSecrets } from '../security/secrets';
import { detectProjectMetadata } from '../project/detector';

export function generateDiagnosticId(): string {
  const chars = '0123456789ABCDEF';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars[Math.floor(Math.random() * chars.length)];
  }
  return `BZX-2026-${rand}`;
}

export function compileDiagnosticReport({
  report,
  project,
  executionState,
}: {
  report: UserBugReport;
  project?: Project;
  executionState?: ExecutionState;
}): string {
  const browserInfo = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown Browser';
  const platform = typeof navigator !== 'undefined' ? navigator.platform : 'Unknown Platform';

  const meta = project ? detectProjectMetadata(project.files) : null;

  const rawBody = `[BILZX CODEX — DIAGNOSTIC BUG REPORT]
Diagnostic ID : ${report.diagnosticId}
App Version   : 1.0.0 (Beta)
Brand         : BilzxDev
Severity      : ${report.severity}
Platform/OS   : ${platform}
User-Agent    : ${browserInfo}
Timestamp     : ${new Date().toISOString()}

==================================================
1. RINGKASAN MASALAH
Title       : ${report.title}
Description : ${report.description}

2. LANGKAH REPRODUKSI
${report.stepsToReproduce || 'Tidak ada langkah terperinci.'}

3. HASIL YANG DIHARAPKAN vs AKTUAL
Expected: ${report.expectedResult || 'N/A'}
Actual  : ${report.actualResult || 'N/A'}

==================================================
4. DIAGNOSTIK WORKSPACE
Project Type : ${meta ? meta.framework : 'N/A'}
Runtime Target: ${meta ? meta.runtime : 'N/A'}
Total Files  : ${project ? project.files.length : 0}

${
  report.includeConsoleLogs && executionState
    ? `5. LOGS KONSOL TERAKHIR:
[Status]: ${executionState.status} (Exit: ${executionState.exitCode})
[Duration]: ${executionState.duration}ms
[Stderr]:
${executionState.stderr || 'None'}
[Stdout Snippet]:
${executionState.stdout.slice(0, 300) || 'None'}`
    : ''
}
`;

  return sanitizeSecrets(rawBody);
}

export const SUPPORT_CONTACTS = {
  whatsapp1: {
    number: '62881025984524',
    label: 'WhatsApp Support 1 (+62 881-0259-84524)',
  },
  whatsapp2: {
    number: '6289673870940',
    label: 'WhatsApp Support 2 (+62 896-7387-0940)',
  },
  email: {
    address: 'cssupportbilzxcodex01@gmail.com',
    label: 'Email Support (cssupportbilzxcodex01@gmail.com)',
  },
};

export function createWhatsAppReportUrl(phoneNumber: string, diagnosticText: string): string {
  const text = encodeURIComponent(diagnosticText.slice(0, 3000));
  return `https://wa.me/${phoneNumber}?text=${text}`;
}

export function createEmailReportUrl(title: string, diagnosticText: string): string {
  const subject = encodeURIComponent(`[BILZX CODEX BUG] ${title || 'Issue Report'}`);
  const body = encodeURIComponent(diagnosticText);
  return `mailto:${SUPPORT_CONTACTS.email.address}?subject=${subject}&body=${body}`;
}
