// src/core/logger/index.js
import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';
import { compressLogFile, startLogMaintenance } from '../../shared/utils/logMaintenance.js';

const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const isDev = process.env.NODE_ENV === 'development';

const rotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'app-%DATE%.log'), // e.g. app-2025-11-12.log
  datePattern: 'YYYY-MM-DD',
  maxFiles: '30d',
  zippedArchive: false, // we will compress via our script
  level: 'info',
  auditFile: path.join(logDir, 'app-audit.json'), // Custom audit file name
});

const transports = [
  ...(isDev
    ? [
        new winston.transports.Console({
          format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
      ]
    : []),
  rotateTransport,
  new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
];

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(
      ({ timestamp, level, message, stack }) =>
        `[${timestamp}] ${level.toUpperCase()}: ${stack || message}`,
    ),
  ),
  transports,
});

// Handle uncaught exceptions (file)
logger.exceptions.handle(
  new winston.transports.File({ filename: path.join(logDir, 'exceptions.log') }),
);

// Start background maintenance (compress yesterday, cleanup) - optional: you can call this from index.js instead
startLogMaintenance();

/**
 * Listen to rotation events: when file rotates, winston-daily-rotate-file emits 'rotate'.
 * Callback signature: (oldFilename, newFilename) in many versions.
 * We'll accept both the one-arg and two-arg styles conservatively.
 */
rotateTransport.on('rotate', (oldFilename, newFilename) => {
  // Some versions pass only one argument; normalize it
  const rotatedFile = typeof newFilename === 'string' && newFilename ? oldFilename : oldFilename;
  // If two args, oldFilename is the old and newFilename is the new file; when zippedArchive=false,
  // oldFilename should be the full path to the rotated file we want to compress.
  const fileToCompress = rotatedFile || oldFilename;

  if (fileToCompress && fileToCompress.endsWith('.log')) {
    // compress the file immediately
    compressLogFile(fileToCompress).catch((err) => {
      console.error('Error compressing rotated log file:', fileToCompress, err);
    });
  }
});

export { logger };
