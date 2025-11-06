/**
 * Main worker process entry point
 * This worker runs continuously and processes tasks
 */

import { Worker } from './worker';

// Graceful shutdown handler
let shutdown = false;

const gracefulShutdown = (signal: string) => {
  console.log(`Received ${signal}, initiating graceful shutdown...`);
  shutdown = true;
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Unhandled error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Main execution
async function main() {
  console.log('Starting worker process...');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Process ID: ${process.pid}`);

  const worker = new Worker();

  try {
    await worker.start();
    console.log('Worker started successfully');

    // Keep the process alive
    const keepAlive = setInterval(() => {
      if (shutdown) {
        clearInterval(keepAlive);
        worker.stop().then(() => {
          console.log('Worker stopped gracefully');
          process.exit(0);
        });
      }
    }, 1000);
  } catch (error) {
    console.error('Failed to start worker:', error);
    process.exit(1);
  }
}

main();

