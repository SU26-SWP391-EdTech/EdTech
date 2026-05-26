import axios from 'axios';

export const getAuthErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
    if (error.response?.status === 401) {
      return 'Email or password is incorrect';
    }
  }
  return 'Something went wrong. Please try again.';
};
