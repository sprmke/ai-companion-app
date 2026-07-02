'use client';

import { useContext, useState } from 'react';

import axios from 'axios';
import { toast } from 'sonner';

import { AuthContext } from '@/context/AuthContext';

export function useTokenTopup() {
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  const startTopup = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const customerResponse = await axios.post('/api/create-customer', {
        email: user.email,
        name: user.name,
      });

      const sessionResponse = await axios.post('/api/create-topup-checkout', {
        customerId: customerResponse.data.id,
        userId: user._id,
        successUrl: `${window.location.origin}/workspace?payment=topup&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/workspace`,
      });

      window.location.href = sessionResponse.data.url;
    } catch (error) {
      console.error('Error creating top-up checkout session:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, startTopup };
}
