import { ApiError } from '../../src/shared/utils/ApiError.js';

describe('ApiError', () => {
  describe('Constructor', () => {
    test('should create ApiError with default values', () => {
      const error = new ApiError(500);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Something went wrong');
      expect(error.success).toBe(false);
      expect(error.data).toBe(null);
      expect(error.errors).toEqual([]);
      expect(error.stack).toBeDefined();
    });

    test('should create ApiError with custom message', () => {
      const error = new ApiError(400, 'Custom error message');

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Custom error message');
      expect(error.success).toBe(false);
    });

    test('should create ApiError with errors array', () => {
      const errors = ['Field1 is required', 'Field2 is invalid'];
      const error = new ApiError(422, 'Validation failed', errors);

      expect(error.statusCode).toBe(422);
      expect(error.message).toBe('Validation failed');
      expect(error.errors).toEqual(errors);
    });

    test('should create ApiError with custom stack', () => {
      const customStack = 'Custom stack trace';
      const error = new ApiError(500, 'Error', [], customStack);

      expect(error.stack).toBe(customStack);
    });

    test('should capture stack trace when no custom stack provided', () => {
      const error = new ApiError(400);

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ApiError');
    });

    test('should handle different status codes correctly', () => {
      const testCases = [
        { statusCode: 200, expectedSuccess: true },
        { statusCode: 201, expectedSuccess: true },
        { statusCode: 300, expectedSuccess: true },
        { statusCode: 399, expectedSuccess: true },
        { statusCode: 400, expectedSuccess: false },
        { statusCode: 401, expectedSuccess: false },
        { statusCode: 403, expectedSuccess: false },
        { statusCode: 404, expectedSuccess: false },
        { statusCode: 500, expectedSuccess: false },
        { statusCode: 502, expectedSuccess: false },
      ];

      testCases.forEach(({ statusCode, expectedSuccess }) => {
        const error = new ApiError(statusCode);
        expect(error.success).toBe(expectedSuccess);
      });
    });

    test('should handle empty errors array', () => {
      const error = new ApiError(400, 'Error', []);

      expect(error.errors).toEqual([]);
    });

    test('should handle null errors array', () => {
      const error = new ApiError(400, 'Error', null);

      expect(error.errors).toEqual(null);
    });

    test('should be throwable and catchable', () => {
      expect(() => {
        throw new ApiError(400, 'Test error');
      }).toThrow('Test error');
    });

    test('should preserve Error prototype chain', () => {
      const error = new ApiError(500);

      expect(error instanceof Error).toBe(true);
      expect(Object.prototype.toString.call(error)).toBe('[object Error]');
    });

    test('should have correct name property', () => {
      const error = new ApiError(400);

      expect(error.name).toBe('ApiError');
    });
  });

  describe('Inheritance', () => {
    test('should inherit from Error', () => {
      const error = new ApiError(500);

      expect(error).toBeInstanceOf(Error);
      expect(typeof error.message).toBe('string');
      expect(typeof error.stack).toBe('string');
    });

    test('should work with try-catch blocks', () => {
      let caughtError = null;

      try {
        throw new ApiError(404, 'Not found');
      } catch (error) {
        caughtError = error;
      }

      expect(caughtError).toBeInstanceOf(ApiError);
      expect(caughtError.statusCode).toBe(404);
      expect(caughtError.message).toBe('Not found');
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero status code', () => {
      const error = new ApiError(0);

      expect(error.statusCode).toBe(0);
      expect(error.success).toBe(true); // 0 < 400
    });

    test('should handle very large status code', () => {
      const error = new ApiError(999);

      expect(error.statusCode).toBe(999);
      expect(error.success).toBe(false); // 999 >= 400
    });

    test('should handle negative status code', () => {
      const error = new ApiError(-1);

      expect(error.statusCode).toBe(-1);
      expect(error.success).toBe(true); // -1 < 400
    });

    test('should handle empty message', () => {
      const error = new ApiError(400, '');

      expect(error.message).toBe('');
    });

    test('should handle very long message', () => {
      const longMessage = 'a'.repeat(10000);
      const error = new ApiError(400, longMessage);

      expect(error.message).toBe(longMessage);
    });
  });
});
