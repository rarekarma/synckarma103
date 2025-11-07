/**
 * EventHandler class that handles PubSub subscription events
 */

export class EventHandler {
  private shutdownCallback?: () => Promise<void>;

  constructor(shutdownCallback?: () => Promise<void>) {
    this.shutdownCallback = shutdownCallback;
  }

  /**
   * Handle events from PubSub subscription
   */
  handleEvents(_subscription: any, callbackType: string, data: unknown): void {
    switch (callbackType) {
      case 'event': {
        const eventData = data as any;
        console.log(
          `📨 Received event ${_subscription.topicName} - Handling ${eventData.payload.ChangeEventHeader.entityName} change event ` +
            `with Replay ID ${eventData.replayId} ` +
            `(${_subscription.receivedEventCount}/${_subscription.requestedEventCount} ` +
            `events received so far)`
        );
        console.log(
          JSON.stringify(
            data,
            (key, value) =>
              typeof value === 'bigint' ? value.toString() : value,
            2
          )
        );
        break;
      }
      case 'lastEvent': {
        // Last event received
        console.log(
          `${_subscription.topicName} - Reached last of ${_subscription.requestedEventCount} requested event on channel. Closing connection.`
        );
        break;
      }
      case 'end': {
        // Client closed the connection
        console.log('Client shut down gracefully.');
        break;
      }
      case 'error': {
        console.error('❌ Subscription error:', data);
        
        // Check if this is an authentication error (code 16 = UNAUTHENTICATED)
        const error = data as any;
        if (error?.code === 16 || error?.details?.includes('authentication')) {
          console.error('🚨 Authentication error detected. Shutting down worker...');
          console.log('SF_ACCESS_TOKEN:', process.env.SF_ACCESS_TOKEN);
          console.log('SF_INSTANCE_URL:', process.env.SF_INSTANCE_URL);
          console.log('SF_ORG_ID:', process.env.SF_ORG_ID);
          if (this.shutdownCallback) {
            this.shutdownCallback().catch((err) => {
              console.error('Error during shutdown:', err);
              process.exit(1);
            });
          }
        }
        break;
      }
      default:
        break;
    }
  }
}

