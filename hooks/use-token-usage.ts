'use client';

import { useContext, useMemo } from 'react';

import { AuthContext } from '@/context/AuthContext';

export const FREE_PLAN_TOKENS = 5000;
export const PRO_PLAN_TOKENS = 10000;

export function useTokenUsage() {
  const { user } = useContext(AuthContext);

  return useMemo(() => {
    const maxTokens = user?.orderId ? PRO_PLAN_TOKENS : FREE_PLAN_TOKENS;
    const remaining = Math.max(0, user?.credits ?? 0);
    const used = Math.max(0, maxTokens - remaining);
    const usagePercent =
      maxTokens > 0 ? Math.min(100, (used / maxTokens) * 100) : 0;
    const planLabel = user?.orderId ? 'Pro' : 'Free';

    return {
      maxTokens,
      remaining,
      used,
      usagePercent,
      planLabel,
      isPro: Boolean(user?.orderId),
    };
  }, [user?.credits, user?.orderId]);
}
