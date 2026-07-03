type EdenUsage = {
  total_tokens?: number;
  completion_tokens?: number;
  prompt_tokens?: number;
};

export function countWords(text: unknown): number {
  if (typeof text !== 'string') return 0;
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function resolveTokenDeduction({
  usage,
  inputMessage,
  responseMessage,
}: {
  usage?: EdenUsage | null;
  inputMessage?: string;
  responseMessage?: unknown;
}): number {
  const totalTokens = usage?.total_tokens;
  if (typeof totalTokens === 'number' && totalTokens > 0) {
    return Math.ceil(totalTokens);
  }

  const promptTokens = usage?.prompt_tokens;
  const completionTokens = usage?.completion_tokens;
  if (
    typeof promptTokens === 'number' &&
    typeof completionTokens === 'number' &&
    promptTokens + completionTokens > 0
  ) {
    return Math.ceil(promptTokens + completionTokens);
  }

  return countWords(inputMessage) + countWords(responseMessage);
}
