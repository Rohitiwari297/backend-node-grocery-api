import { ApiResponse } from '../../src/shared/utils/ApiResponse.js';

describe('ApiResponse', () => {
  describe('Constructor', () => {
    test('should create ApiResponse with default success message', () => {
      const response = new ApiResponse(200, { data: 'test' });

      expect(response.statusCode).toBe(200);
      expect(response.data).toEqual({ data: 'test' });
      expect(response.message).toBe('Success');
      expect(response.success).toBe(true);
    });

    test('should create ApiResponse with custom message', () => {
      const response = new ApiResponse(201, { id: 1 }, 'Created successfully');

      expect(response.statusCode).toBe(201);
      expect(response.data).toEqual({ id: 1 });
      expect(response.message).toBe('Created successfully');
      expect(response.success).toBe(true);
    });

    test('should handle success status codes correctly', () => {
      const successCodes = [200, 201, 204, 300, 301, 302];

      successCodes.forEach(statusCode => {
        const response = new ApiResponse(statusCode, {}, 'Success');
        expect(response.success).toBe(true);
        expect(response.statusCode).toBe(statusCode);
      });
    });

    test('should handle error status codes correctly', () => {
      const errorCodes = [400, 401, 403, 404, 500, 502];

      errorCodes.forEach(statusCode => {
        const response = new ApiResponse(statusCode, {}, 'Error');
        expect(response.success).toBe(false);
        expect(response.statusCode).toBe(statusCode);
      });
    });

    test('should handle boundary status codes', () => {
      const successResponse = new ApiResponse(399, {}, 'Success');
      expect(successResponse.success).toBe(true);

      const errorResponse = new ApiResponse(400, {}, 'Error');
      expect(errorResponse.success).toBe(false);
    });

    test('should handle null data', () => {
      const response = new ApiResponse(200, null, 'No data');

      expect(response.data).toBe(null);
      expect(response.message).toBe('No data');
      expect(response.success).toBe(true);
    });

    test('should handle undefined data', () => {
      const response = new ApiResponse(200, undefined, 'Undefined data');

      expect(response.data).toBe(undefined);
      expect(response.message).toBe('Undefined data');
      expect(response.success).toBe(true);
    });

    test('should handle empty object data', () => {
      const response = new ApiResponse(200, {}, 'Empty data');

      expect(response.data).toEqual({});
      expect(response.message).toBe('Empty data');
      expect(response.success).toBe(true);
    });

    test('should handle array data', () => {
      const arrayData = [1, 2, 3];
      const response = new ApiResponse(200, arrayData, 'Array data');

      expect(response.data).toEqual(arrayData);
      expect(response.message).toBe('Array data');
      expect(response.success).toBe(true);
    });

    test('should handle string data', () => {
      const stringData = 'Simple string';
      const response = new ApiResponse(200, stringData, 'String data');

      expect(response.data).toBe(stringData);
      expect(response.message).toBe('String data');
      expect(response.success).toBe(true);
    });

    test('should handle number data', () => {
      const numberData = 42;
      const response = new ApiResponse(200, numberData, 'Number data');

      expect(response.data).toBe(numberData);
      expect(response.message).toBe('Number data');
      expect(response.success).toBe(true);
    });

    test('should handle boolean data', () => {
      const booleanData = true;
      const response = new ApiResponse(200, booleanData, 'Boolean data');

      expect(response.data).toBe(booleanData);
      expect(response.message).toBe('Boolean data');
      expect(response.success).toBe(true);
    });
  });

  describe('Real-world Scenarios', () => {
    test('should create successful user creation response', () => {
      const userData = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date(),
      };

      const response = new ApiResponse(201, userData, 'User created successfully');

      expect(response.statusCode).toBe(201);
      expect(response.success).toBe(true);
      expect(response.data).toEqual(userData);
      expect(response.message).toBe('User created successfully');
    });

    test('should create error response for validation failure', () => {
      const errorData = {
        errors: [
          { field: 'email', message: 'Email is required' },
          { field: 'password', message: 'Password must be at least 8 characters' },
        ],
      };

      const response = new ApiResponse(422, errorData, 'Validation failed');

      expect(response.statusCode).toBe(422);
      expect(response.success).toBe(false);
      expect(response.data).toEqual(errorData);
      expect(response.message).toBe('Validation failed');
    });

    test('should create not found response', () => {
      const response = new ApiResponse(404, null, 'Resource not found');

      expect(response.statusCode).toBe(404);
      expect(response.success).toBe(false);
      expect(response.data).toBe(null);
      expect(response.message).toBe('Resource not found');
    });

    test('should create paginated response', () => {
      const paginatedData = {
        items: [{ id: 1 }, { id: 2 }, { id: 3 }],
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          pages: 3,
        },
      };

      const response = new ApiResponse(200, paginatedData, 'Items retrieved successfully');

      expect(response.statusCode).toBe(200);
      expect(response.success).toBe(true);
      expect(response.data).toEqual(paginatedData);
      expect(response.message).toBe('Items retrieved successfully');
    });

    test('should create file upload response', () => {
      const fileData = {
        filename: 'avatar.jpg',
        path: '/uploads/avatar.jpg',
        size: 1024,
        mimetype: 'image/jpeg',
      };

      const response = new ApiResponse(200, fileData, 'File uploaded successfully');

      expect(response.statusCode).toBe(200);
      expect(response.success).toBe(true);
      expect(response.data).toEqual(fileData);
      expect(response.message).toBe('File uploaded successfully');
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero status code', () => {
      const response = new ApiResponse(0, {}, 'Zero status');

      expect(response.statusCode).toBe(0);
      expect(response.success).toBe(true); // 0 < 400
    });

    test('should handle very large status code', () => {
      const response = new ApiResponse(999, {}, 'Large status');

      expect(response.statusCode).toBe(999);
      expect(response.success).toBe(false); // 999 >= 400
    });

    test('should handle negative status code', () => {
      const response = new ApiResponse(-1, {}, 'Negative status');

      expect(response.statusCode).toBe(-1);
      expect(response.success).toBe(true); // -1 < 400
    });

    test('should handle empty message', () => {
      const response = new ApiResponse(200, {}, '');

      expect(response.message).toBe('');
      expect(response.success).toBe(true);
    });

    test('should handle very long message', () => {
      const longMessage = 'a'.repeat(10000);
      const response = new ApiResponse(200, {}, longMessage);

      expect(response.message).toBe(longMessage);
      expect(response.success).toBe(true);
    });

    test('should handle complex nested data', () => {
      const complexData = {
        user: {
          id: 1,
          profile: {
            personal: {
              name: 'John',
              age: 30,
            },
            preferences: {
              theme: 'dark',
              notifications: true,
            },
          },
        },
        metadata: {
          version: '1.0.0',
          timestamp: new Date().toISOString(),
        },
      };

      const response = new ApiResponse(200, complexData, 'Complex data');

      expect(response.data).toEqual(complexData);
      expect(response.success).toBe(true);
    });
  });

  describe('Object Properties', () => {
    test('should have all required properties', () => {
      const response = new ApiResponse(200, { test: true }, 'Test message');

      expect(response).toHaveProperty('statusCode');
      expect(response).toHaveProperty('data');
      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('success');
    });

    test('should be serializable to JSON', () => {
      const response = new ApiResponse(200, { test: true }, 'Test message');
      const jsonString = JSON.stringify(response);
      const parsedResponse = JSON.parse(jsonString);

      expect(parsedResponse.statusCode).toBe(200);
      expect(parsedResponse.data).toEqual({ test: true });
      expect(parsedResponse.message).toBe('Test message');
      expect(parsedResponse.success).toBe(true);
    });
  });
});
