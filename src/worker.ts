/**
 * Worker class that handles the main processing logic
 */

import PubSubApiClient from 'salesforce-pubsub-api-client';
import { EventHandler } from './event-handler';

const pubSubApiClient = new PubSubApiClient({
  authType: 'user-supplied',
  accessToken: process.env.SF_ACCESS_TOKEN,
  instanceUrl: process.env.SF_INSTANCE_URL,
  organizationId: process.env.SF_ORG_ID
});

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
      console.warn('Worker is already running');
      return;
    }

    this.isRunning = true;
    console.log('Worker started');
    await pubSubApiClient.connect();
    console.log('✅ Connected to Salesforce PubSub');
    
    console.log('Attempting to subscribe to PubSub...');
    pubSubApiClient.subscribe('/data/OrderChangeEvent', this.eventHandler.handleEvents.bind(this.eventHandler), 3);
    console.log('✅ Subscribed to PubSub');

    // Example: Run a task every 5 seconds
    // Adjust this interval based on your needs
    this.intervalId = setInterval(async () => {
      await this.processTask();
    }, 5000);

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

    console.log('Stopping worker...');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    // Wait for any in-flight tasks to complete
    await this.waitForCompletion();
    console.log('Worker stopped');
    process.exit(0);
  }

  /**
   * Process a single task
   * Replace this with your actual task processing logic
   */
  private async processTask(): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] Checking that pubsub is connected...`);

      // TODO: Add your task processing logic here
      // Example: Fetch from queue, process data, send notifications, etc.

      await this.simulateWork();

      console.log(`[${timestamp}] Task completed successfully`);
    } catch (error) {
      console.error('Error processing task:', error);
      // Decide whether to continue or stop on error
    }
  }

  /**
   * Simulate work (replace with actual logic)
   */
  private async simulateWork(): Promise<void> {
    // Simulate async work
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
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
