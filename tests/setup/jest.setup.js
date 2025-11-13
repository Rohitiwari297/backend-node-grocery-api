import { connectDB, disconnectDB, clearDB } from '../setup/testDB.js';

beforeAll(async () => {
  await connectDB();
});

afterEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await disconnectDB();
});
