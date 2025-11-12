import app from './app.js';
import { connectMongo } from './core/db/index.js';
import { logger } from './core/logger/index.js';

connectMongo()
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      logger.info(`🚀 Server started on port  http://localhost:${PORT}`);
      console.log(`🚀 Server started on port  http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    logger.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });
