/**
 * Main worker process entry point
 * This worker runs continuously and processes tasks
 */

import { Worker } from './worker';
import { logger } from './logger';

// Graceful shutdown handler
let shutdown = false;

const gracefulShutdown = (signal: string) => {
  logger.info({ signal }, 'Received signal, initiating graceful shutdown');
  shutdown = true;
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Unhandled error handlers
process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled Rejection');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error({ error }, 'Uncaught Exception');
  process.exit(1);
});

// Main execution
async function main() {
  logger.info('Starting worker process');
  logger.info({ 
    environment: process.env.NODE_ENV || 'development',
    pid: process.pid 
  }, 'Worker process info');

  const worker = new Worker();

  try {
    await worker.start();
    logger.info('Worker started successfully');

    // Keep the process alive
    const keepAlive = setInterval(() => {
      if (shutdown) {
        clearInterval(keepAlive);
        worker.stop().then(() => {
          logger.info('Worker stopped gracefully');
          process.exit(0);
        });
      }
    }, 1000);
  } catch (error) {
    logger.error({ error }, 'Failed to start worker');
    process.exit(1);
  }
}

main();

