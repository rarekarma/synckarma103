import { AccountChangeEvent, Account } from './account';
import { OrderChangeEvent, Order } from './order';
import { NetSuite } from './netsuite';
import { NetSuiteCustomerMatch } from './netsuite-customer-match';
import { logger } from './logger';

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
        logger.info({
          topicName: _subscription.topicName,
          requestedEventCount: _subscription.requestedEventCount
        }, 'Reached last requested event on channel. Closing connection.');
        break;
      }
      case 'end': {
        // Client closed the connection
        logger.info('Client shut down gracefully.');
        break;
      }
      case 'error': {
        logger.error({ error: data }, 'Subscription error');
        
        // Check if this is an authentication error (code 16 = UNAUTHENTICATED)
        const error = data as any;
        if (error?.code === 16 || error?.details?.includes('authentication')) {
          logger.error({
            code: error?.code,
            details: error?.details,
            hasAccessToken: !!process.env.SF_ACCESS_TOKEN,
            hasInstanceUrl: !!process.env.SF_INSTANCE_URL,
            hasOrgId: !!process.env.SF_ORG_ID
          }, 'Authentication error detected. Shutting down worker...');
          if (this.shutdownCallback) {
            this.shutdownCallback().catch((err) => {
              logger.error({ error: err }, 'Error during shutdown');
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
    logger.info({
      topicName: _subscription.topicName,
      entityName: eventData.payload.ChangeEventHeader?.entityName,
      replayId: eventData.replayId,
      receivedEventCount: _subscription.receivedEventCount,
      requestedEventCount: _subscription.requestedEventCount
    }, 'Received event');
    logger.debug({
      eventData: JSON.parse(JSON.stringify(
        data,
        (key, value) => (typeof value === 'bigint' ? value.toString() : value)
      ))
    }, 'Event data');
    switch (_subscription.topicName) {
      case '/data/OrderChangeEvent': {
        void this.handleOrderChangeEvent(eventData);
        break;
      }
      case '/data/AccountChangeEvent': {
        void this.handleAccountChangeEvent(eventData);
        break;
      }
      default: {
        logger.error({ topicName: _subscription.topicName }, 'Unknown subscription topic');
        break;
      }
    }
  }

  /**
   * Handle Order Change Event
   */
  private async handleOrderChangeEvent(eventData: any): Promise<void> {
    try {
      const orderChangeEvent = new OrderChangeEvent(eventData);
      await this.processOrderChangeEvent(orderChangeEvent);
    } catch (error) {
      logger.error({ error }, 'Failed to parse Order event data');
    }
  }

  private async processOrderChangeEvent(orderChangeEvent: OrderChangeEvent): Promise<void> {
    const orderId = orderChangeEvent.payload.ChangeEventHeader?.recordIds[0];
    if (!orderId) { // this should never happen because we're only processing order change events
      logger.error('Order ID is missing from ChangeEventHeader');
      return;
    }
    const changedFields: string[] = orderChangeEvent.payload.ChangeEventHeader?.changedFields ?? [];
    const changeType = orderChangeEvent.payload.ChangeEventHeader?.changeType;
    logger.info({ 
      orderId, 
      changedFields, 
      changeType 
    }, 'Order Change Event');
    
    // Check if order is created and activated, or just became activated
    const isStatusChanged = changedFields.includes('Status');
    const isCreateAndActivated = changeType === 'CREATE' && orderChangeEvent.payload.Status === 'Activated';
    const isStatusActivated = isStatusChanged && orderChangeEvent.payload.Status === 'Activated';
    
    if (isCreateAndActivated || isStatusActivated) {
      logger.info({ orderId }, 'Order is activated. Getting full order data...');
      // Always fetch full order data to ensure we have the latest AccountId
      const order = await Order.getOrder(orderId);
      
      // Check if order is actually activated
      if (order.Status === 'Activated' && order.AccountId) {
        logger.info({ 
          orderId, 
          accountId: order.AccountId 
        }, 'Order is activated. Setting synckarma103__Requires_NetSuite_Customer_Mapping__c to true on Account');
        await Account.updateRequiresNetSuiteCustomerMapping(order.AccountId, true);
        logger.info({ accountId: order.AccountId }, 'Successfully updated Account');
      } else {
        logger.debug({ 
          orderId, 
          status: order.Status, 
          accountId: order.AccountId 
        }, 'Order is not activated or AccountId is missing');
      }
    }
  }

  /**
   * Handle Account Change Event
   */
  private async handleAccountChangeEvent(eventData: any): Promise<void> {
    try {
      const accountChangeEvent = new AccountChangeEvent(eventData);
      await this.processAccountChangeEvent(accountChangeEvent);
    } catch (error) {
      logger.error({ error }, 'Failed to parse Account event data');
    }
  }

  private async processAccountChangeEvent(accountChangeEvent: AccountChangeEvent): Promise<void> {
    const accountId = accountChangeEvent.payload.ChangeEventHeader?.recordIds[0];
    if (!accountId) { // this should never happen because we're only processing account change events
      logger.error('Account ID is missing from ChangeEventHeader');
      return;
    }
    const changedFields: string[] = accountChangeEvent.payload.ChangeEventHeader?.changedFields ?? [];
    logger.info({ accountId, changedFields }, 'Account Change Event');
    const netSuiteCustomerId = accountChangeEvent.payload.synckarma103__NetSuite_Customer_ID__c;
    const isNetSuiteCustomerIdNullOrBlank = !netSuiteCustomerId || netSuiteCustomerId.trim() === '';
    if (
      changedFields.includes('synckarma103__Requires_NetSuite_Customer_Mapping__c') &&
      isNetSuiteCustomerIdNullOrBlank
    ) {
      logger.info({ accountId }, 'Getting matches from NetSuite...');
      let account: Account;
      if (accountChangeEvent.payload.ChangeEventHeader?.changeType === 'UPDATE') {
        logger.debug({ accountId }, 'Account payload is an update, getting all account data');
        account = await Account.getAccount(accountId);
      } else {
        // TODO: investigate if we need this because do we even have changed fields for CREATE events?
        // For CREATE events, construct Account from the payload (excluding ChangeEventHeader)
        account = new Account(accountChangeEvent.payload);
      }
      
      logger.debug({ 
        accountId, 
        accountName: account.Name,
        postalCode: account.BillingAddress?.PostalCode,
        phone: account.Phone
      }, 'Account details');
      const likelyMatchesJSON = await this.netSuite.getCustomerLikelyMatches(account, accountId);
      logger.debug({ accountId, matchesJSON: likelyMatchesJSON }, 'Likely NetSuite customer matches');
      const namespace = process.env.SF_NAMESPACE ?? '';
      const netSuiteCustomerMatch = new NetSuiteCustomerMatch(accountId, likelyMatchesJSON, namespace);
      const netSuiteCustomerMatchId = await netSuiteCustomerMatch.createInSalesforce();
      logger.info({ accountId, netSuiteCustomerMatchId }, 'NetSuite Customer Match created');
    }
  }
}

