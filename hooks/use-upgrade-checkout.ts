'use client';

import { useContext, useState } from 'react';

import axios from 'axios';
import { toast } from 'sonner';

import { AuthContext } from '@/context/AuthContext';

export function useUpgradeCheckout() {
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  const isPro = Boolean(user?.orderId);

  const startCheckout = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const customerResponse = await axios.post('/api/create-customer', {
        email: user.email,
        name: user.name,
      });

      const sessionResponse = await axios.post('/api/create-checkout-session', {
        customerId: customerResponse.data.id,
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
        successUrl: `${window.location.origin}/workspace/success`,
        cancelUrl: `${window.location.origin}/workspace`,
      });

      window.location.href = sessionResponse.data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return { isPro, isLoading, startCheckout };
}
