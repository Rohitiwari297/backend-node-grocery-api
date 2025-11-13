import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Otp } from '../../src/models/auth.model.js';

let mongoServer;

beforeAll(async () => {
  // Create in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // 🔧 Ensure no existing Mongoose connection is active
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  // ✅ Connect to the in-memory MongoDB
  await mongoose.connect(uri);
});

afterAll(async () => {
  // Cleanly close connection and stop in-memory MongoDB
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clear test data after each test
  await Otp.deleteMany();
});

describe('Otp Model', () => {
  it('should create and save an Otp with a 4-digit OTP successfully', async () => {
    const validOtp = new Otp({
      mobile: '1234567890',
      otp: '1234',
      otpExpires: new Date(Date.now() + 5 * 60000),
    });

    const savedOtp = await validOtp.save();

    expect(savedOtp._id).toBeDefined();
    expect(savedOtp.mobile).toBe('1234567890');
    expect(savedOtp.otp).toBe('1234');
    expect(savedOtp.otpExpires).toBeInstanceOf(Date);
    expect(savedOtp.createdAt).toBeDefined();
    expect(savedOtp.updatedAt).toBeDefined();
  });

  it('should fail if OTP is not 4 digits', async () => {
    const invalidOtps = ['123', '12345', 'abcd', '12a4'];

    for (const otpValue of invalidOtps) {
      const otp = new Otp({
        mobile: '1234567890',
        otp: otpValue,
        otpExpires: new Date(Date.now() + 5 * 60000),
      });

      let err;
      try {
        await otp.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors.otp).toBeDefined();
      expect(err.errors.otp.message).toMatch(/is not a valid 4-digit OTP/);
    }
  });

  it('should fail if required fields are missing', async () => {
    const otp = new Otp({});
    let err;
    try {
      await otp.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.mobile).toBeDefined();
    expect(err.errors.otp).toBeDefined();
    expect(err.errors.otpExpires).toBeDefined();
  });
});
