import { AccountChangeEvent, Account } from './account';
import { NetSuite } from './netsuite';

/**
 * EventHandler class that handles PubSub subscription events
 */

export class EventHandler {
  private shutdownCallback?: () => Promise<void>;
  private readonly netSuite: NetSuite;

  constructor(shutdownCallback?: () => Promise<void>) {
    this.shutdownCallback = shutdownCallback;
    this.netSuite = new NetSuite();
  }

  /**
   * Dispatch PubSub subscription callbacks
   */
  handleCallback(_subscription: any, callbackType: string, data: unknown): void {
    switch (callbackType) {
      case 'event': {
        this.handleEvents(_subscription, data);
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

  /**
   * Handle individual PubSub event
   */
  private handleEvents(_subscription: any, data: unknown): void {
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
        (key, value) => (typeof value === 'bigint' ? value.toString() : value),
        2
      )
    );
    switch (_subscription.topicName) {
      case '/data/OrderChangeEvent': {
        this.handleOrderChangeEvent(eventData);
        break;
      }
      case '/data/AccountChangeEvent': {
        void this.handleAccountChangeEvent(eventData);
        break;
      }
      default: {
        console.error('❌ Unknown subscription topic:', _subscription.topicName);
        break;
      }
    }
  }

  /**
   * Handle Order Change Event
   */
  private handleOrderChangeEvent(eventData: any): void {
    console.log('Order Change Event:', eventData);
  }

  /**
   * Handle Account Change Event
   */
  private async handleAccountChangeEvent(eventData: any): Promise<void> {
    try {
      const accountChangeEvent = new AccountChangeEvent(eventData);
      await this.processAccountChangeEvent(accountChangeEvent);
    } catch (error) {
      console.error('Failed to parse Account event data:', error);
    }
  }

  private async processAccountChangeEvent(accountChangeEvent: AccountChangeEvent): Promise<void> {
    const changedFields: string[] = accountChangeEvent.payload.ChangeEventHeader?.changedFields ?? [];
    console.log('Account Change Event.  Changed fields:', changedFields);
    const netSuiteCustomerId = accountChangeEvent.payload.synckarma103__NetSuite_Customer_ID__c;
    const isNetSuiteCustomerIdNullOrBlank = !netSuiteCustomerId || netSuiteCustomerId.trim() === '';
    if (
      changedFields.includes('synckarma103__Requires_NetSuite_Customer_Mapping__c') &&
      isNetSuiteCustomerIdNullOrBlank
    ) {
      console.log('Getting matches from NetSuite...');
      let account: Account;
      const accountId = accountChangeEvent.payload.ChangeEventHeader?.recordIds[0];
      if (accountChangeEvent.payload.ChangeEventHeader?.changeType === 'UPDATE') {
        if (!accountId) {
          console.error('Account ID is missing from ChangeEventHeader');
          return;
        }
        console.log(`DEBUG: Account payload is an update, getting all account data for ${accountId}`);
        account = await Account.getAccount(accountId);
      } else {
        // TODO: investigate if we need this because do we even have changed fields for CREATE events?
        // For CREATE events, construct Account from the payload (excluding ChangeEventHeader)
        account = new Account(accountChangeEvent.payload);
      }
      // TODO: this is still passing in an Account without name, postalCode or phone.  Are we getting this data from Salesforce?
      console.log('Account Name:', account.Name);
      console.log('Account Postal Code:', account.BillingAddress?.PostalCode);
      console.log('Account Phone:', account.Phone);
      const likelyMatchesJSON = await this.netSuite.getCustomerLikelyMatches(account, accountId);
      console.log('Likely NetSuite customer matches:', likelyMatchesJSON);
    }
  }
}

