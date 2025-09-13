export const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const isOtpValid = (otp: string): boolean => {
  return /^\d{6}$/.test(otp);
};

export const hashOtp = (otp: string): string => {
  // In production, you might want to hash the OTP
  // For now, we'll store it in plain text for simplicity
  return otp;
};
