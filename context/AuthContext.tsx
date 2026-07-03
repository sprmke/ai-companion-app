import { createContext, Dispatch, SetStateAction } from 'react';

import { User } from '@/app/(main)/types';

type AuthContextType = {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  isAuthReady: boolean;
  setAuthReady: (ready: boolean) => void;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isAuthReady: false,
  setAuthReady: () => {},
});
