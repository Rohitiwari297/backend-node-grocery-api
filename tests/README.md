# Testing Guide

This document provides comprehensive information about the testing setup and practices for the MultiVendor Grocery API.

## 🧪 Testing Stack

- **Test Framework**: Jest
- **HTTP Testing**: Supertest
- **Database**: MongoDB Memory Server (in-memory MongoDB for testing)
- **Assertions**: Jest built-in matchers
- **Coverage**: Jest coverage reports

## 📁 Test Structure

```
tests/
├── setup/                 # Test setup and configuration
│   ├── jest.setup.js     # Global test setup/teardown
│   └── testDB.js         # Database connection utilities
├── helpers/              # Test helpers and utilities
│   └── testData.js       # Test data generators
├── models/               # Model tests
│   ├── auth.model.test.js
│   └── user.model.test.js
└── utils/                # Utility function tests
    ├── ApiError.test.js
    ├── ApiResponse.test.js
    └── asyncHandler.test.js
```

## 🚀 Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npm test -- tests/models/user.model.test.js
```

### Run Tests Matching Pattern
```bash
npm test -- --testNamePattern="should create user"
```

## ⚙️ Test Configuration

### Jest Configuration (`jest.config.js`)
```javascript
export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.js'],
  transform: {},
  testTimeout: 30000, // 30 seconds for MongoDB startup
};
```

### Environment Setup
Tests use MongoDB Memory Server for isolated database testing:
- **In-memory MongoDB**: No external database required
- **Automatic cleanup**: Database cleared between tests
- **Fast execution**: Tests run quickly without I/O overhead

## 🗄️ Database Testing

### Test Database Utilities

#### `connectDB()`
- Starts MongoDB Memory Server
- Connects to the in-memory database
- Called automatically before all tests

#### `clearDB()`
- Clears all collections between tests
- Ensures test isolation
- Called automatically after each test

#### `disconnectDB()`
- Drops database and closes connection
- Stops MongoDB Memory Server
- Called automatically after all tests

### Example Test with Database
```javascript
import { User } from '../../src/models/user.model.js';
import { createTestUser } from '../helpers/testData.js';

describe('User Model', () => {
  it('should create a new user', async () => {
    const userData = createTestUser();
    const user = new User(userData);
    const savedUser = await user.save();
    
    expect(savedUser.name).toBe(userData.name);
    expect(savedUser.mobile).toBe(userData.mobile);
  });
});
```

## 🛠️ Test Helpers

### `testData.js` Utilities

#### `generateTestToken(userId, mobile)`
Generates JWT tokens for testing authentication:
```javascript
const token = generateTestToken('user123', '1234567890');
```

#### `createTestUser(overrides)`
Creates test user data with optional overrides:
```javascript
const user = createTestUser({
  name: 'Custom Name',
  email: 'custom@example.com'
});
```

#### `generateTestOTP()`
Generates a 4-digit OTP for testing:
```javascript
const otp = generateTestOTP(); // e.g., "1234"
```

#### `createTestOTP(mobile, otp)`
Creates test OTP data with expiration:
```javascript
const otpData = createTestOTP('1234567890', '5678');
```

## 📝 Writing Tests

### Test File Naming Convention
- Test files should end with `.test.js`
- Place tests in corresponding directories under `tests/`
- Example: `src/models/user.model.js` → `tests/models/user.model.test.js`

### Test Structure
```javascript
describe('Feature/Component', () => {
  // Setup before all tests in this describe block
  beforeAll(async () => {
    // Setup code
  });

  // Cleanup after all tests in this describe block
  afterAll(async () => {
    // Cleanup code
  });

  // Setup before each test
  beforeEach(async () => {
    // Setup code
  });

  // Cleanup after each test
  afterEach(async () => {
    // Cleanup code
  });

  it('should do something specific', async () => {
    // Arrange - Setup test data
    // Act - Execute the code being tested
    // Assert - Verify the results
  });
});
```

### Async/Await Testing
```javascript
it('should handle async operations', async () => {
  const result = await someAsyncFunction();
  expect(result).toBeDefined();
});
```

### Error Testing
```javascript
it('should throw an error for invalid input', async () => {
  await expect(invalidFunction())
    .rejects
    .toThrow('Expected error message');
});
```

## 🔍 API Testing with Supertest

### Example API Test
```javascript
import request from 'supertest';
import app from '../../src/app.js';

describe('Auth API', () => {
  it('should register a new user', async () => {
    const userData = createTestUser();
    
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.mobile).toBe(userData.mobile);
    expect(response.body.data.token).toBeDefined();
  });
});
```

### Authentication Test Helper
```javascript
const authenticatedRequest = (token) => {
  return request(app).set('Authorization', `Bearer ${token}`);
};

it('should access protected route', async () => {
  const token = generateTestToken('user123');
  const response = await authenticatedRequest(token)
    .get('/api/users/profile')
    .expect(200);
});
```

## 📊 Coverage Reports

### Generating Coverage
```bash
npm run test:coverage
```

### Coverage Thresholds
Configure coverage thresholds in `jest.config.js`:
```javascript
export default {
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Coverage Report Formats
- **Console**: Summary displayed in terminal
- **HTML**: Detailed report in `coverage/lcov-report/index.html`
- **JSON**: Machine-readable report in `coverage/coverage-final.json`

## 🎯 Best Practices

### Test Organization
- **Group related tests** using `describe()` blocks
- **Use descriptive test names** that explain what is being tested
- **Follow AAA pattern**: Arrange, Act, Assert
- **Keep tests focused** on one behavior per test

### Test Data Management
- **Use factory functions** for creating test data
- **Avoid hardcoded values** in tests
- **Clean up test data** after each test
- **Use realistic data** that matches production scenarios

### Database Testing
- **Use in-memory database** for fast, isolated tests
- **Clear database between tests** to avoid interference
- **Test both success and failure scenarios**
- **Mock external dependencies** when necessary

### Performance Considerations
- **Use appropriate timeouts** for database operations
- **Avoid unnecessary database connections**
- **Run tests in parallel** when possible
- **Use selective test running** during development

## 🐛 Debugging Tests

### Running Tests in Debug Mode
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Console Logging in Tests
```javascript
it('should debug test data', async () => {
  const data = createTestUser();
  console.log('Test data:', data);
  // Test assertions
});
```

### Breaking on Failures
```bash
npm test -- --bail
```

## 📋 Test Checklist

Before submitting code, ensure:
- [ ] All new features have corresponding tests
- [ ] All tests pass locally
- [ ] Coverage meets project thresholds
- [ ] Tests are properly organized and named
- [ ] Test data is cleaned up appropriately
- [ ] Edge cases are covered
- [ ] Error scenarios are tested

## 🔗 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)