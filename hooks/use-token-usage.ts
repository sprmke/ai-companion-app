'use client';

import { useContext, useMemo } from 'react';

import { AuthContext } from '@/context/AuthContext';
import {
  FREE_PLAN_TOKENS,
  PRO_PLAN_TOKENS,
} from '@/lib/billing/constants';

export { FREE_PLAN_TOKENS, PRO_PLAN_TOKENS, TOKEN_TOPUP_TOKENS, TOKEN_TOPUP_PRICE_CENTS } from '@/lib/billing/constants';

export function useTokenUsage() {
  const { user } = useContext(AuthContext);

  return useMemo(() => {
    const planAllowance = user?.orderId ? PRO_PLAN_TOKENS : FREE_PLAN_TOKENS;
    const topupCredits = user?.topupCredits ?? 0;
    const maxTokens = planAllowance + topupCredits;
    const remaining = Math.max(0, user?.credits ?? 0);
    const used = Math.max(0, maxTokens - remaining);
    const usagePercent =
      maxTokens > 0 ? Math.min(100, (used / maxTokens) * 100) : 0;
    const planLabel = user?.orderId ? 'Pro' : 'Free';

    const isMaxedOut = remaining <= 0;

    return {
      planAllowance,
      topupCredits,
      maxTokens,
      remaining,
      used,
      usagePercent,
      planLabel,
      isPro: Boolean(user?.orderId),
      isMaxedOut,
    };
  }, [user?.credits, user?.orderId, user?.topupCredits]);
}
