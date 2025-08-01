import crypto from 'crypto';

// Generate a random verification token
export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate a random password reset token
export const generatePasswordResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Set token expiration (24 hours from now)
export const setTokenExpiration = () => {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + 24);
  return expiration;
};

// Check if token is expired
export const isTokenExpired = (expirationDate) => {
  return new Date() > new Date(expirationDate);
}; 