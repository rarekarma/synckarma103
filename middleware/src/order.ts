import { ChangeEventHeader } from './account';

export interface OrderPayload {
  ChangeEventHeader: ChangeEventHeader | null;
  Status: string | null;
  AccountId: string | null;
  OrderNumber: string | null;
  TotalAmount: number | null;
  EffectiveDate: number | null;
  EndDate: number | null;
  CreatedDate: number | null;
  CreatedById: string | null;
  LastModifiedDate: number | null;
  LastModifiedById: string | null;
}

export class OrderChangeEvent {
  public readonly id: string;
  public readonly schemaId: string;
  public readonly replayId: number;
  public readonly payload: OrderPayload;

  constructor(eventData: any) {
    if (!eventData) {
      throw new Error('eventData is required to construct OrderChangeEvent');
    }

    this.id = eventData.id ?? '';
    this.schemaId = eventData.schemaId ?? '';
    this.replayId = eventData.replayId ?? 0;

    const payload = eventData.payload ?? {};
    this.payload = {
      ChangeEventHeader: this.normalizeChangeEventHeader(payload.ChangeEventHeader),
      Status: payload.Status ?? null,
      AccountId: payload.AccountId ?? null,
      OrderNumber: payload.OrderNumber ?? null,
      TotalAmount: payload.TotalAmount ?? null,
      EffectiveDate: payload.EffectiveDate ?? null,
      EndDate: payload.EndDate ?? null,
      CreatedDate: payload.CreatedDate ?? null,
      CreatedById: payload.CreatedById ?? null,
      LastModifiedDate: payload.LastModifiedDate ?? null,
      LastModifiedById: payload.LastModifiedById ?? null
    };
  }

  private normalizeChangeEventHeader(header: any): ChangeEventHeader {
    return {
      entityName: header?.entityName ?? null,
      recordIds: header?.recordIds ?? [],
      changeType: header?.changeType ?? null,
      changeOrigin: header?.changeOrigin ?? null,
      transactionKey: header?.transactionKey ?? null,
      sequenceNumber: header?.sequenceNumber ?? null,
      commitTimestamp: header?.commitTimestamp ?? null,
      commitNumber: header?.commitNumber ?? null,
      commitUser: header?.commitUser ?? null,
      nulledFields: header?.nulledFields ?? [],
      diffFields: header?.diffFields ?? [],
      changedFields: header?.changedFields ?? []
    };
  }
}

export class Order {
  public readonly Status: string | null;
  public readonly AccountId: string | null;
  public readonly OrderNumber: string | null;
  public readonly TotalAmount: number | null;
  public readonly EffectiveDate: number | null;
  public readonly EndDate: number | null;
  public readonly CreatedDate: number | null;
  public readonly CreatedById: string | null;
  public readonly LastModifiedDate: number | null;
  public readonly LastModifiedById: string | null;

  constructor(payload: OrderPayload);
  constructor(orderData: {
    Status?: string | null;
    AccountId?: string | null;
    OrderNumber?: string | null;
    TotalAmount?: number | null;
    EffectiveDate?: number | null;
    EndDate?: number | null;
    CreatedDate?: number | null;
    CreatedById?: string | null;
    LastModifiedDate?: number | null;
    LastModifiedById?: string | null;
  });
  constructor(payloadOrData: OrderPayload | {
    Status?: string | null;
    AccountId?: string | null;
    OrderNumber?: string | null;
    TotalAmount?: number | null;
    EffectiveDate?: number | null;
    EndDate?: number | null;
    CreatedDate?: number | null;
    CreatedById?: string | null;
    LastModifiedDate?: number | null;
    LastModifiedById?: string | null;
  }) {
    // Check if it's an OrderPayload (has ChangeEventHeader property)
    const orderData = 'ChangeEventHeader' in payloadOrData
      ? {
          Status: payloadOrData.Status,
          AccountId: payloadOrData.AccountId,
          OrderNumber: payloadOrData.OrderNumber,
          TotalAmount: payloadOrData.TotalAmount,
          EffectiveDate: payloadOrData.EffectiveDate,
          EndDate: payloadOrData.EndDate,
          CreatedDate: payloadOrData.CreatedDate,
          CreatedById: payloadOrData.CreatedById,
          LastModifiedDate: payloadOrData.LastModifiedDate,
          LastModifiedById: payloadOrData.LastModifiedById
        }
      : payloadOrData;
    this.Status = orderData.Status ?? null;
    this.AccountId = orderData.AccountId ?? null;
    this.OrderNumber = orderData.OrderNumber ?? null;
    this.TotalAmount = orderData.TotalAmount ?? null;
    this.EffectiveDate = orderData.EffectiveDate ?? null;
    this.EndDate = orderData.EndDate ?? null;
    this.CreatedDate = orderData.CreatedDate ?? null;
    this.CreatedById = orderData.CreatedById ?? null;
    this.LastModifiedDate = orderData.LastModifiedDate ?? null;
    this.LastModifiedById = orderData.LastModifiedById ?? null;
  }

  /**
   * Fetches full order data from Salesforce REST API
   * @param orderId - Salesforce Order record ID
   * @returns Order instance
   */
  static async getOrder(orderId: string): Promise<Order> {
    if (!orderId) {
      throw new Error('Order ID is required to fetch order');
    }

    const instanceUrl = process.env.SF_INSTANCE_URL;
    const accessToken = process.env.SF_ACCESS_TOKEN;

    if (!instanceUrl || !accessToken) {
      throw new Error('SF_INSTANCE_URL and SF_ACCESS_TOKEN environment variables are required');
    }

    // Build the Salesforce REST API URL
    const apiUrl = `${instanceUrl}/services/data/v58.0/sobjects/Order/${orderId}`;

    // Fetch order data from Salesforce
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch order from Salesforce: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const orderData = (await response.json()) as any;

    return new Order({
      Status: orderData.Status ?? null,
      AccountId: orderData.AccountId ?? null,
      OrderNumber: orderData.OrderNumber ?? null,
      TotalAmount: orderData.TotalAmount ?? null,
      EffectiveDate: orderData.EffectiveDate ? new Date(orderData.EffectiveDate).getTime() : null,
      EndDate: orderData.EndDate ? new Date(orderData.EndDate).getTime() : null,
      CreatedDate: orderData.CreatedDate ? new Date(orderData.CreatedDate).getTime() : null,
      CreatedById: orderData.CreatedById ?? null,
      LastModifiedDate: orderData.LastModifiedDate ? new Date(orderData.LastModifiedDate).getTime() : null,
      LastModifiedById: orderData.LastModifiedById ?? null
    });
  }
}


