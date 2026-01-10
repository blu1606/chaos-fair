/**
 * Account API Service
 */

import { config } from '@/config/appMode';
import { supabase } from '@/integrations/supabase/client';
import * as mockData from '../mockData';

export interface Account {
  id: string;
  user_id: string;
  plan_type: string;
  credit_balance: number;
  credit_limit: number;
  created_at: string;
  updated_at: string;
}

export const fetchAccount = async (userId: string): Promise<Account> => {
  if (config.useMockData) {
    // Map mock data to Account interface
    return {
      id: mockData.mockAccount.id,
      user_id: 'mock-user-id',
      plan_type: mockData.mockAccount.plan_type,
      credit_balance: mockData.mockAccount.available_credits,
      credit_limit: mockData.mockAccount.total_credits,
      created_at: mockData.mockAccount.subscription_start,
      updated_at: new Date().toISOString(),
    };
  }
  
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    user_id: data.user_id,
    plan_type: data.plan_type || 'free',
    credit_balance: data.available_credits || 0,
    credit_limit: data.plan_limit || 10000,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};
