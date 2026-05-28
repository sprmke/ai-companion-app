import { createContext } from 'react';

import { AiAssistant } from '@/app/(main)/types';

type AssistantContextType = {
  assistant: AiAssistant | null;
  setAssistant: (assistant: AiAssistant | null) => void;
  isWorkspaceLoading: boolean;
  setWorkspaceLoading: (loading: boolean) => void;
  assistantsRefreshKey: number;
  requestAssistantsRefresh: () => void;
};

export const AssistantContext = createContext<AssistantContextType>({
  assistant: null,
  setAssistant: () => {},
  isWorkspaceLoading: false,
  setWorkspaceLoading: () => {},
  assistantsRefreshKey: 0,
  requestAssistantsRefresh: () => {},
});
