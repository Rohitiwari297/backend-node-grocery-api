import mongoose from 'mongoose';
import { User } from '../../src/models/user.model.js';
import { createTestUser } from '../helpers/testData.js';

describe('User Model', () => {
  describe('Validation', () => {
    test('should create a valid user document', async () => {
      const userData = createTestUser();
      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.name).toBe(userData.name);
      expect(savedUser.mobile).toBe(userData.mobile);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.avatar).toBe(userData.avatar);
      expect(savedUser.location).toBe(userData.location);
      expect(savedUser.createdAt).toBeInstanceOf(Date);
      expect(savedUser.updatedAt).toBeInstanceOf(Date);
    });

    test('should create user with only mobile number', async () => {
      const user = new User({ mobile: '1234567890' });
      const savedUser = await user.save();

      expect(savedUser.mobile).toBe('1234567890');
      expect(savedUser.name).toBeUndefined();
      expect(savedUser.email).toBeUndefined();
      expect(savedUser.avatar).toBeUndefined();
      expect(savedUser.location).toBe('');
    });

    test('should set default location to empty string', async () => {
      const userData = createTestUser();
      delete userData.location;

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.location).toBe('');
    });

    test('should allow optional fields to be undefined', async () => {
      const user = new User({ mobile: '9876543210' });
      const savedUser = await user.save();

      expect(savedUser.mobile).toBe('9876543210');
      expect(savedUser.name).toBeUndefined();
      expect(savedUser.email).toBeUndefined();
      expect(savedUser.avatar).toBeUndefined();
    });
  });

  describe('Methods', () => {
    describe('generateAuthToken', () => {
      beforeEach(() => {
        process.env.JWT_SECRET = 'test_secret';
        process.env.JWT_EXPIRES = '1h';
      });

      test('should generate a valid JWT token', async () => {
        const userData = createTestUser();
        const user = new User(userData);
        await user.save();

        const token = user.generateAuthToken();

        expect(typeof token).toBe('string');
        expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
      });

      test('should include user ID in token payload', async () => {
        const userData = createTestUser();
        const user = new User(userData);
        await user.save();

        const token = user.generateAuthToken();
        const decoded = JSON.parse(atob(token.split('.')[1]));

        expect(decoded._id).toBe(user._id.toString());
        expect(decoded.mobile).toBe(userData.mobile);
      });

      test('should use default JWT_EXPIRES if not set', async () => {
        delete process.env.JWT_EXPIRES;

        const userData = createTestUser();
        const user = new User(userData);
        await user.save();

        const token = user.generateAuthToken();
        const decoded = JSON.parse(atob(token.split('.')[1]));

        // Default is 365 days, so exp should be far in future
        const currentTime = Math.floor(Date.now() / 1000);
        expect(decoded.exp).toBeGreaterThan(currentTime + 364 * 24 * 60 * 60); // ~364 days
      });

      test('should use custom JWT_EXPIRES if set', async () => {
        process.env.JWT_EXPIRES = '2h';

        const userData = createTestUser();
        const user = new User(userData);
        await user.save();

        const token = user.generateAuthToken();
        const decoded = JSON.parse(atob(token.split('.')[1]));

        const currentTime = Math.floor(Date.now() / 1000);
        expect(decoded.exp).toBeLessThan(currentTime + 3 * 60 * 60); // Less than 3 hours
        expect(decoded.exp).toBeGreaterThan(currentTime + 60 * 60); // More than 1 hour
      });
    });
  });

  describe('Queries', () => {
    test('should find user by mobile number', async () => {
      const userData = createTestUser({ mobile: '9876543210' });
      await User.create(userData);

      const foundUser = await User.findOne({ mobile: '9876543210' });

      expect(foundUser).toBeTruthy();
      expect(foundUser.mobile).toBe('9876543210');
      expect(foundUser.name).toBe(userData.name);
    });

    test('should find user by ID', async () => {
      const userData = createTestUser();
      const savedUser = await User.create(userData);

      const foundUser = await User.findById(savedUser._id);

      expect(foundUser).toBeTruthy();
      expect(foundUser._id.toString()).toBe(savedUser._id.toString());
      expect(foundUser.mobile).toBe(userData.mobile);
    });

    test('should update user by ID', async () => {
      const userData = createTestUser();
      const savedUser = await User.create(userData);

      const updateData = { name: 'Updated Name', email: 'updated@example.com' };
      const updatedUser = await User.findByIdAndUpdate(savedUser._id, updateData, { new: true });

      expect(updatedUser.name).toBe('Updated Name');
      expect(updatedUser.email).toBe('updated@example.com');
      expect(updatedUser.mobile).toBe(userData.mobile);
    });

    test('should find all users', async () => {
      const users = [
        createTestUser({ mobile: '1111111111' }),
        createTestUser({ mobile: '2222222222' }),
        createTestUser({ mobile: '3333333333' }),
      ];

      await User.create(users);

      const foundUsers = await User.find();

      expect(foundUsers).toHaveLength(3);
      expect(foundUsers.map((u) => u.mobile)).toEqual(expect.arrayContaining(['1111111111', '2222222222', '3333333333']));
    });
  });

  describe('Timestamps', () => {
    test('should automatically add timestamps', async () => {
      const userData = createTestUser();
      const beforeCreate = new Date();

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(savedUser.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
    });

    test('should update updatedAt on save', async () => {
      const userData = createTestUser();
      const user = new User(userData);
      const savedUser = await user.save();

      const originalUpdatedAt = savedUser.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      savedUser.name = 'Updated Name';
      await savedUser.save();

      expect(savedUser.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
