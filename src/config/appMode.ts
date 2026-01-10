/**
 * App Mode Configuration
 * 
 * TESTING: Mock data, bypass auth - for UI/UX development
 * DEV: Real Supabase API, bypass auth - for API integration development
 * PRODUCTION: Real API, real auth - for production
 */

export type AppMode = 'testing' | 'dev' | 'production';

// Change this to switch modes
const APP_MODE = 'testing' as AppMode;

export const config = {
  mode: APP_MODE as AppMode,
  
  // Feature flags based on mode
  get useMockData() {
    return this.mode === 'testing';
  },
  get bypassAuth() {
    return this.mode === 'testing' || this.mode === 'dev';
  },
  
  // Mock user for bypassed auth
  mockUser: {
    id: 'dev-user-001',
    email: 'dev@dekaos.io',
    name: 'Dev User',
    plan_type: 'pro',
    avatar_url: null,
    wallet_address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  },
};

// Helper to check current mode
export const isTestingMode = (): boolean => config.mode === 'testing';
export const isDevMode = (): boolean => config.mode === 'dev';
export const isProductionMode = (): boolean => config.mode === 'production';

// Console log current mode on app start
if (typeof window !== 'undefined') {
  const useMock = config.mode === 'testing';
  const bypassAuth = config.mode === 'testing' || config.mode === 'dev';
  console.log(
    `%c🔧 deKAOS Mode: ${APP_MODE.toUpperCase()} %c${useMock ? '| Mock Data' : '| Real API'} ${bypassAuth ? '| Auth Bypassed' : '| Auth Required'}`,
    'background: #8b5cf6; color: white; padding: 4px 8px; border-radius: 4px;',
    'color: #22d3ee;'
  );
}
