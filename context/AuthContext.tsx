import { createContext } from 'react';

import { User } from '@/app/(main)/types';

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthReady: boolean;
  setAuthReady: (ready: boolean) => void;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isAuthReady: false,
  setAuthReady: () => {},
});
