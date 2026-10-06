export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ConfidenceAssessment {
  score: number; // 0 to 100
  level: ConfidenceLevel;
  label: string;
  allowAutoApply: boolean;
  reasons: string[];
}

/**
 * Calculates a verified confidence rating for an AI fix suggestion.
 * Evaluates whether syntax is fully parseable, whether dependencies are strictly defined,
 * and if side-effects are bounded.
 */
export function calculateFixConfidence({
  hasSyntaxVerified,
  isMissingImportOrDep,
  isLocalizedChange,
  hasRollbackSnapshot,
  isComplexRefactor,
}: {
  hasSyntaxVerified: boolean;
  isMissingImportOrDep: boolean;
  isLocalizedChange: boolean;
  hasRollbackSnapshot: boolean;
  isComplexRefactor?: boolean;
}): ConfidenceAssessment {
  let score = 50;
  const reasons: string[] = [];

  if (hasSyntaxVerified) {
    score += 25;
    reasons.push('Sintaks hasil perbaikan valid dan terverifikasi secara statik.');
  }

  if (isMissingImportOrDep) {
    score += 20;
    reasons.push('Pola deklarasi dependensi terdefinisi dengan jelas.');
  }

  if (isLocalizedChange) {
    score += 15;
    reasons.push('Perubahan bersifat terisolasi pada satu baris/blok fungsi.');
  } else {
    score -= 10;
    reasons.push('Perubahan melibatkan struktur multi-line yang lebih luas.');
  }

  if (hasRollbackSnapshot) {
    score += 5;
    reasons.push('Snapshot rollback tersedia.');
  }

  if (isComplexRefactor) {
    score -= 20;
    reasons.push('Perubahan arsitektur memerlukan verifikasi manual.');
  }

  // Bound score between 40 and 96 (never fake 100% or absolute perfection)
  score = Math.max(40, Math.min(96, score));

  let level: ConfidenceLevel = 'low';
  let label = `${score}% — Low Confidence`;
  let allowAutoApply = false;

  if (score >= 90) {
    level = 'high';
    label = `${score}% — High Confidence`;
    allowAutoApply = true;
  } else if (score >= 70) {
    level = 'medium';
    label = `${score}% — Medium Confidence`;
    allowAutoApply = false;
  } else {
    level = 'low';
    label = `${score}% — Low Confidence`;
    allowAutoApply = false;
  }

  return {
    score,
    level,
    label,
    allowAutoApply,
    reasons,
  };
}
