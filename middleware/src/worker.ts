/**
 * Worker class that handles the main processing logic
 */

import PubSubApiClient from 'salesforce-pubsub-api-client';
import { EventHandler } from './event-handler';
import { logger } from './logger';

const pubSubApiClient = new PubSubApiClient({
  authType: 'user-supplied',
  // environment variables are set in the container app by terraform
  // see .env.terraform for the values
  accessToken: process.env.SF_ACCESS_TOKEN,
  instanceUrl: process.env.SF_INSTANCE_URL,
  organizationId: process.env.SF_ORG_ID
}, logger);

export class Worker {
  private isRunning: boolean = false;
  private intervalId?: NodeJS.Timeout;
  private eventHandler: EventHandler;

  constructor() {
    this.eventHandler = new EventHandler(() => this.stop());
  }

  /**
   * Start the worker process
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Worker is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Worker started');
    await pubSubApiClient.connect();
    logger.info('Connected to Salesforce PubSub');
    
    pubSubApiClient.subscribe(
      '/data/OrderChangeEvent',
      this.eventHandler.handleCallback.bind(this.eventHandler),
      100
    );
    logger.info('Subscribed to OrderChangeEvent');
    pubSubApiClient.subscribe(
      '/data/AccountChangeEvent',
      this.eventHandler.handleCallback.bind(this.eventHandler),
      100
    );
    logger.info('Subscribed to AccountChangeEvent');

    // Example: Run a task every 60 seconds
    // Adjust this interval based on your needs
    this.intervalId = setInterval(async () => {
      await this.processTask();
    }, 60000);

    // Process initial task immediately
    await this.processTask();
  }

  /**
   * Stop the worker process
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      process.exit(0);
      return;
    }

    logger.info('Stopping worker...');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    // Wait for any in-flight tasks to complete
    await this.waitForCompletion();
    logger.info('Worker stopped');
    process.exit(0);
  }

  /**
   * Process a single task
   * Replace this with your actual task processing logic
   */
  private async processTask(): Promise<void> {
    try {
      logger.debug('Checking that pubsub is connected...');
      await this.checkPubSubConnection();
      logger.debug('Task completed successfully');
    } catch (error) {
      logger.error({ error }, 'Error processing task');
      // Decide whether to continue or stop on error
    }
  }

  private async checkPubSubConnection(): Promise<void> {
    // Simulate async work
    const state = await pubSubApiClient.getConnectivityState();
    logger.debug({ state }, 'Connectivity state');
    // if (connection) {
    //   logger.info('PubSub connection is healthy');
    // } else {
    //   logger.error('PubSub connection is not healthy');
    // }
  }

  /**
   * Wait for any in-flight tasks to complete
   */
  private async waitForCompletion(): Promise<void> {
    // Wait a bit for any ongoing tasks to finish
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  }

  /**
   * Check if the worker is currently running
   */
  isActive(): boolean {
    return this.isRunning;
  }
}
