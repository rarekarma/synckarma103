import pino from 'pino';

/**
 * Configured pino logger instance
 * Uses pretty printing in development if pino-pretty is available, JSON otherwise
 */
function createLogger() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Try to use pino-pretty in development if available
  if (isDevelopment) {
    try {
      // Check if pino-pretty is available
      require.resolve('pino-pretty');
      console.log('Using pino-pretty for logging');
      
      // Use pino-pretty as a destination stream (not transport) for synchronous output
      // This ensures logs appear immediately when debugging
      const pinoPretty = require('pino-pretty')({
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname'
      });
      
      return pino({
        level: process.env.LOG_LEVEL || 'info'
      }, pinoPretty);
    } catch (e) {
      // pino-pretty not available, fall back to JSON logger
      console.log('Using JSON logger');
      return pino({
        level: process.env.LOG_LEVEL || 'info'
      });
    }
  }
  
  // Production: use JSON logger
  return pino({
    level: process.env.LOG_LEVEL || 'info'
  });
}

export const logger = createLogger();

