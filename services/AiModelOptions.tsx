export const DEFAULT_AI_MODEL_ID = 'google/gemini-2.5-flash';

const DEPRECATED_MODEL_IDS: Record<string, string> = {
  'anthropic/claude-3-5-haiku-latest': 'anthropic/claude-haiku-4-5',
  'google/gemini-2.0-flash': 'google/gemini-2.5-flash',
};

export const aiModelOptions = [
  {
    name: 'Google: Gemini 2.5 Flash',
    id: DEFAULT_AI_MODEL_ID,
    logo: '/google.png',
  },
  {
    name: 'OpenAI: GPT-4o-mini',
    id: 'openai/gpt-4o-mini',
    logo: '/chatgpt.png',
  },
  {
    name: 'OpenAI: GPT-3.5 Turbo',
    id: 'openai/gpt-3.5-turbo',
    logo: '/chatgpt.png',
  },
  {
    name: 'Mistral: Pixtral Large',
    id: 'mistral/pixtral-large-latest',
    logo: '/Mistral.png',
  },
  {
    name: 'Anthropic: Claude Haiku 4.5',
    id: 'anthropic/claude-haiku-4-5',
    logo: '/anthropic.png',
  },
];

export function resolveAiModelId(modelId?: string) {
  if (!modelId) return DEFAULT_AI_MODEL_ID;

  if (DEPRECATED_MODEL_IDS[modelId]) {
    return DEPRECATED_MODEL_IDS[modelId];
  }

  const isKnown = aiModelOptions.some(({ id }) => id === modelId);
  return isKnown ? modelId : DEFAULT_AI_MODEL_ID;
}
