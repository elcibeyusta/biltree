export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateBilkentEmail = (email: string): boolean => {
  if (!validateEmail(email)) return false;
  const allowedDomains = ['ug.bilkent.edu.tr', 'cs.bilkent.edu.tr', 'bilkent.edu.tr'];
  const domain = email.split('@')[1].toLowerCase();
  return allowedDomains.includes(domain);
};

export const validatePassword = (password: string): { valid: boolean; error?: string } => {
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' };
  }
  return { valid: true };
};

export const validateAboutText = (text: string): { valid: boolean; error?: string } => {
  if (text.length > 500) {
    return { valid: false, error: 'About text cannot exceed 500 characters' };
  }
  return { valid: true };
};

