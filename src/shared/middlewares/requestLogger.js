import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../core/logger/index.js';

const requestLogger = (req, res, next) => {
  const requestId = uuidv4();
  req.id = requestId;
  const startTime = Date.now();

  logger.info(`➡️ [${requestId}] ${req.method} ${req.originalUrl}`);

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const status = res.statusCode;
    const logMessage = `⬅️ [${requestId}] ${req.method} ${req.originalUrl} [${status}] - ${duration}ms`;

    if (status >= 500) logger.error(logMessage);
    else if (status >= 400) logger.warn(logMessage);
    else logger.info(logMessage);
  });

  next();
};

export { requestLogger };
