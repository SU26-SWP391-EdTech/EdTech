export interface PasswordStrength {
  level: number;
  label: string;
  color: string;
}

export function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password) && /[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) {
    return { level: 1, label: 'Weak', color: '#EF4444' };
  } else if (score === 2) {
    return { level: 2, label: 'Fair', color: '#F59E0B' };
  } else if (score === 3) {
    return { level: 3, label: 'Good', color: '#3B82F6' };
  } else {
    return { level: 4, label: 'Strong', color: '#10B981' };
  }
}
