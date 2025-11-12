// src/utils/log-maintenance.js
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);
const logDir = path.resolve('logs');
const RETENTION_DAYS = Number(process.env.LOG_RETENTION_DAYS || 30);

if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

/**
 * Compress a single log file to .gz and remove the original .log.
 * Returns the gz filename, or throws on error.
 */
export const compressLogFile = async (logFilePath) => {
  try {
    if (!fs.existsSync(logFilePath)) {
      throw new Error(`File not found: ${logFilePath}`);
    }
    const gzPath = logFilePath.replace(/\.log$/, '.gz');
    if (fs.existsSync(gzPath)) return gzPath; // already compressed

    const data = fs.readFileSync(logFilePath);
    const compressed = await gzip(data);
    fs.writeFileSync(gzPath, compressed);
    fs.unlinkSync(logFilePath);
    console.log(`🗜️ Compressed ${path.basename(logFilePath)} → ${path.basename(gzPath)}`);
    return gzPath;
  } catch (err) {
    console.error('compressLogFile error:', err);
    throw err;
  }
};

/**
 * Compress a pattern: e.g. all files ending with -YYYY-MM-DD.log
 */
export const compressLogsForDate = (dateStr) => {
  const files = fs.readdirSync(logDir).filter((f) => f.endsWith(`-${dateStr}.log`));
  return Promise.all(files.map((f) => compressLogFile(path.join(logDir, f)).catch((e) => e)));
};

/**
 * Delete old .gz logs older than RETENTION_DAYS
 */
export const cleanupOldZips = () => {
  const now = Date.now();
  const files = fs.readdirSync(logDir).filter((f) => f.endsWith('.gz'));

  files.forEach((f) => {
    const match = f.match(/(\d{4}-\d{2}-\d{2})/);
    if (!match) return;
    const fileDate = new Date(match[1]).getTime();
    const ageDays = (now - fileDate) / (1000 * 60 * 60 * 24);

    if (ageDays > RETENTION_DAYS) {
      try {
        fs.unlinkSync(path.join(logDir, f));
        console.log(`🗑️ Deleted old log: ${f}`);
      } catch (err) {
        console.error('cleanupOldZips error deleting', f, err);
      }
    }
  });
};

/**
 * Run maintenance on startup (compress yesterday) and schedule daily cleanup.
 * Optionally returns the interval ID if you want to clear it later.
 */
export const startLogMaintenance = () => {
  // compress yesterday on startup
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const dateStr = yesterday.toISOString().split('T')[0];
  compressLogsForDate(dateStr).catch((e) => console.error(e));

  // cleanup old gz on startup
  cleanupOldZips();

  // schedule daily job (runs every 24 hours)
  const intervalId = setInterval(
    () => {
      // compress yesterday again (in case it was missed)
      const now2 = new Date();
      const yesterday2 = new Date(now2);
      yesterday2.setDate(now2.getDate() - 1);
      const dateStr2 = yesterday2.toISOString().split('T')[0];
      compressLogsForDate(dateStr2).catch((e) => console.error(e));

      // cleanup old compressed logs
      cleanupOldZips();
    },
    24 * 60 * 60 * 1000,
  );

  return intervalId;
};
