import { jest } from '@jest/globals';
import { asyncHandler } from '../../src/shared/utils/asyncHandler.js'; // adjust path

describe('asyncHandler', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle multiple consecutive calls', async () => {
    const handler = asyncHandler(async (req, res) => {
      res.status(200).json({ message: 'ok' });
    });

    await handler(mockReq, mockRes, mockNext);
    await handler(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'ok' });
  });
});
