export type AuthScreen = 'signin' | 'signup' | 'forgot' | 'verify';

export type AuthRoute =
  | '/auth/sign-in'
  | '/auth/sign-up'
  | '/auth/forgot-password'
  | '/auth/verify-email';
