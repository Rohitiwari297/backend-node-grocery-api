import jwt from 'jsonwebtoken';

export const generateTestToken = (userId, mobile = '1234567890') => {
  return jwt.sign(
    { _id: userId, mobile },
    process.env.JWT_SECRET || 'test_secret',
    { expiresIn: '1h' }
  );
};

export const generateTestOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export const createTestUser = (overrides = {}) => {
  return {
    name: 'Test User',
    mobile: '1234567890',
    email: 'test@example.com',
    avatar: '',
    location: '',
    ...overrides,
  };
};


export const createTestOTP = (mobile = '1234567890', otp = null) => {
  return {
    mobile,
    otp: otp || generateTestOTP(),
    otpExpires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
  };
};
