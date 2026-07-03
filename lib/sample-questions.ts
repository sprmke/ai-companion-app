export const MIN_SAMPLE_QUESTIONS = 1;
export const MAX_SAMPLE_QUESTIONS = 4;

export function normalizeSampleQuestions(questions: string[] | undefined): string[] {
  return (questions ?? [])
    .map((q) => q.trim())
    .filter(Boolean)
    .slice(0, MAX_SAMPLE_QUESTIONS);
}

export function validateSampleQuestions(questions: string[] | undefined): {
  valid: boolean;
  normalized: string[];
  error?: string;
} {
  const normalized = normalizeSampleQuestions(questions);

  if (normalized.length < MIN_SAMPLE_QUESTIONS) {
    return {
      valid: false,
      normalized,
      error: 'Add at least one suggested question.',
    };
  }

  return { valid: true, normalized };
}

/** Ensures the editor always has 1–4 rows to edit. */
export function toEditableSampleQuestions(questions: string[] | undefined): string[] {
  const trimmed = (questions ?? []).slice(0, MAX_SAMPLE_QUESTIONS);
  if (trimmed.length === 0) return [''];
  return trimmed;
}
