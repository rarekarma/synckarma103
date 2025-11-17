export interface ChangeEventHeader {
  entityName: string | null;
  recordIds: string[];
  changeType: string | null;
  changeOrigin: string | null;
  transactionKey: string | null;
  sequenceNumber: number | null;
  commitTimestamp: number | null;
  commitNumber: string | null;
  commitUser: string | null;
  nulledFields: string[];
  diffFields: string[];
  changedFields: string[];
}

export interface Address {
  Street: string | null;
  City: string | null;
  State: string | null;
  PostalCode: string | null;
  Country: string | null;
  Latitude: number | null;
  Longitude: number | null;
  GeocodeAccuracy: string | null;
}

export interface AccountPayload {
  ChangeEventHeader: ChangeEventHeader | null;
  Name: string | null;
  Type: string | null;
  ParentId: string | null;
  BillingAddress: Address | null;
  ShippingAddress: Address | null;
  Phone: string | null;
  Fax: string | null;
  AccountNumber: string | null;
  Website: string | null;
  Sic: string | null;
  Industry: string | null;
  AnnualRevenue: number | null;
  NumberOfEmployees: number | null;
  Ownership: string | null;
  TickerSymbol: string | null;
  Description: string | null;
  Rating: string | null;
  Site: string | null;
  OwnerId: string | null;
  CreatedDate: number | null;
  CreatedById: string | null;
  LastModifiedDate: number | null;
  LastModifiedById: string | null;
  Jigsaw: string | null;
  JigsawCompanyId: string | null;
  CleanStatus: string | null;
  AccountSource: string | null;
  DunsNumber: string | null;
  Tradestyle: string | null;
  NaicsCode: string | null;
  NaicsDesc: string | null;
  YearStarted: string | null;
  SicDesc: string | null;
  DandbCompanyId: string | null;
  OperatingHoursId: string | null;
  synckarma103__NetSuite_Customer_ID__c: string | null;
  synckarma103__Requires_NetSuite_Customer_Mapping__c: string | null;
}

export class AccountChangeEvent {
  public readonly id: string;
  public readonly schemaId: string;
  public readonly replayId: number;
  public readonly payload: AccountPayload;

  constructor(eventData: any) {
    if (!eventData) {
      throw new Error('eventData is required to construct AccountChangeEvent');
    }

    this.id = eventData.id ?? '';
    this.schemaId = eventData.schemaId ?? '';
    this.replayId = eventData.replayId ?? 0;

    const payload = eventData.payload ?? {};
    this.payload = {
      ChangeEventHeader: this.normalizeChangeEventHeader(payload.ChangeEventHeader),
      Name: payload.Name ?? null,
      Type: payload.Type ?? null,
      ParentId: payload.ParentId ?? null,
      BillingAddress: this.normalizeAddress(payload.BillingAddress),
      ShippingAddress: this.normalizeAddress(payload.ShippingAddress),
      Phone: payload.Phone ?? null,
      Fax: payload.Fax ?? null,
      AccountNumber: payload.AccountNumber ?? null,
      Website: payload.Website ?? null,
      Sic: payload.Sic ?? null,
      Industry: payload.Industry ?? null,
      AnnualRevenue: payload.AnnualRevenue ?? null,
      NumberOfEmployees: payload.NumberOfEmployees ?? null,
      Ownership: payload.Ownership ?? null,
      TickerSymbol: payload.TickerSymbol ?? null,
      Description: payload.Description ?? null,
      Rating: payload.Rating ?? null,
      Site: payload.Site ?? null,
      OwnerId: payload.OwnerId ?? null,
      CreatedDate: payload.CreatedDate ?? null,
      CreatedById: payload.CreatedById ?? null,
      LastModifiedDate: payload.LastModifiedDate ?? null,
      LastModifiedById: payload.LastModifiedById ?? null,
      Jigsaw: payload.Jigsaw ?? null,
      JigsawCompanyId: payload.JigsawCompanyId ?? null,
      CleanStatus: payload.CleanStatus ?? null,
      AccountSource: payload.AccountSource ?? null,
      DunsNumber: payload.DunsNumber ?? null,
      Tradestyle: payload.Tradestyle ?? null,
      NaicsCode: payload.NaicsCode ?? null,
      NaicsDesc: payload.NaicsDesc ?? null,
      YearStarted: payload.YearStarted ?? null,
      SicDesc: payload.SicDesc ?? null,
      DandbCompanyId: payload.DandbCompanyId ?? null,
      OperatingHoursId: payload.OperatingHoursId ?? null,
      synckarma103__NetSuite_Customer_ID__c: payload.synckarma103__NetSuite_Customer_ID__c ?? null,
      synckarma103__Requires_NetSuite_Customer_Mapping__c:
        payload.synckarma103__Requires_NetSuite_Customer_Mapping__c ?? null
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

  private normalizeAddress(address: any): Address | null {
    if (!address) {
      return null;
    }

    return {
      Street: address.Street ?? null,
      City: address.City ?? null,
      State: address.State ?? null,
      PostalCode: address.PostalCode ?? null,
      Country: address.Country ?? null,
      Latitude: address.Latitude ?? null,
      Longitude: address.Longitude ?? null,
      GeocodeAccuracy: address.GeocodeAccuracy ?? null
    };
  }
}

export class Account {
  public readonly Name: string | null;
  public readonly Type: string | null;
  public readonly ParentId: string | null;
  public readonly BillingAddress: Address | null;
  public readonly ShippingAddress: Address | null;
  public readonly Phone: string | null;
  public readonly Fax: string | null;
  public readonly AccountNumber: string | null;
  public readonly Website: string | null;
  public readonly Sic: string | null;
  public readonly Industry: string | null;
  public readonly AnnualRevenue: number | null;
  public readonly NumberOfEmployees: number | null;
  public readonly Ownership: string | null;
  public readonly TickerSymbol: string | null;
  public readonly Description: string | null;
  public readonly Rating: string | null;
  public readonly Site: string | null;
  public readonly OwnerId: string | null;
  public readonly CreatedDate: number | null;
  public readonly CreatedById: string | null;
  public readonly LastModifiedDate: number | null;
  public readonly LastModifiedById: string | null;
  public readonly Jigsaw: string | null;
  public readonly JigsawCompanyId: string | null;
  public readonly CleanStatus: string | null;
  public readonly AccountSource: string | null;
  public readonly DunsNumber: string | null;
  public readonly Tradestyle: string | null;
  public readonly NaicsCode: string | null;
  public readonly NaicsDesc: string | null;
  public readonly YearStarted: string | null;
  public readonly SicDesc: string | null;
  public readonly DandbCompanyId: string | null;
  public readonly OperatingHoursId: string | null;
  public readonly synckarma103__NetSuite_Customer_ID__c: string | null;
  public readonly synckarma103__Requires_NetSuite_Customer_Mapping__c: string | null;

  constructor(payload: AccountPayload);
  constructor(accountData: {
    Name?: string | null;
    Type?: string | null;
    ParentId?: string | null;
    BillingAddress?: Address | null;
    ShippingAddress?: Address | null;
    Phone?: string | null;
    Fax?: string | null;
    AccountNumber?: string | null;
    Website?: string | null;
    Sic?: string | null;
    Industry?: string | null;
    AnnualRevenue?: number | null;
    NumberOfEmployees?: number | null;
    Ownership?: string | null;
    TickerSymbol?: string | null;
    Description?: string | null;
    Rating?: string | null;
    Site?: string | null;
    OwnerId?: string | null;
    CreatedDate?: number | null;
    CreatedById?: string | null;
    LastModifiedDate?: number | null;
    LastModifiedById?: string | null;
    Jigsaw?: string | null;
    JigsawCompanyId?: string | null;
    CleanStatus?: string | null;
    AccountSource?: string | null;
    DunsNumber?: string | null;
    Tradestyle?: string | null;
    NaicsCode?: string | null;
    NaicsDesc?: string | null;
    YearStarted?: string | null;
    SicDesc?: string | null;
    DandbCompanyId?: string | null;
    OperatingHoursId?: string | null;
    synckarma103__NetSuite_Customer_ID__c?: string | null;
    synckarma103__Requires_NetSuite_Customer_Mapping__c?: string | null;
  });
  constructor(payloadOrData: AccountPayload | {
    Name?: string | null;
    Type?: string | null;
    ParentId?: string | null;
    BillingAddress?: Address | null;
    ShippingAddress?: Address | null;
    Phone?: string | null;
    Fax?: string | null;
    AccountNumber?: string | null;
    Website?: string | null;
    Sic?: string | null;
    Industry?: string | null;
    AnnualRevenue?: number | null;
    NumberOfEmployees?: number | null;
    Ownership?: string | null;
    TickerSymbol?: string | null;
    Description?: string | null;
    Rating?: string | null;
    Site?: string | null;
    OwnerId?: string | null;
    CreatedDate?: number | null;
    CreatedById?: string | null;
    LastModifiedDate?: number | null;
    LastModifiedById?: string | null;
    Jigsaw?: string | null;
    JigsawCompanyId?: string | null;
    CleanStatus?: string | null;
    AccountSource?: string | null;
    DunsNumber?: string | null;
    Tradestyle?: string | null;
    NaicsCode?: string | null;
    NaicsDesc?: string | null;
    YearStarted?: string | null;
    SicDesc?: string | null;
    DandbCompanyId?: string | null;
    OperatingHoursId?: string | null;
    synckarma103__NetSuite_Customer_ID__c?: string | null;
    synckarma103__Requires_NetSuite_Customer_Mapping__c?: string | null;
  }) {
    // Check if it's an AccountPayload (has ChangeEventHeader property)
    const accountData = 'ChangeEventHeader' in payloadOrData
      ? {
          Name: payloadOrData.Name,
          Type: payloadOrData.Type,
          ParentId: payloadOrData.ParentId,
          BillingAddress: payloadOrData.BillingAddress,
          ShippingAddress: payloadOrData.ShippingAddress,
          Phone: payloadOrData.Phone,
          Fax: payloadOrData.Fax,
          AccountNumber: payloadOrData.AccountNumber,
          Website: payloadOrData.Website,
          Sic: payloadOrData.Sic,
          Industry: payloadOrData.Industry,
          AnnualRevenue: payloadOrData.AnnualRevenue,
          NumberOfEmployees: payloadOrData.NumberOfEmployees,
          Ownership: payloadOrData.Ownership,
          TickerSymbol: payloadOrData.TickerSymbol,
          Description: payloadOrData.Description,
          Rating: payloadOrData.Rating,
          Site: payloadOrData.Site,
          OwnerId: payloadOrData.OwnerId,
          CreatedDate: payloadOrData.CreatedDate,
          CreatedById: payloadOrData.CreatedById,
          LastModifiedDate: payloadOrData.LastModifiedDate,
          LastModifiedById: payloadOrData.LastModifiedById,
          Jigsaw: payloadOrData.Jigsaw,
          JigsawCompanyId: payloadOrData.JigsawCompanyId,
          CleanStatus: payloadOrData.CleanStatus,
          AccountSource: payloadOrData.AccountSource,
          DunsNumber: payloadOrData.DunsNumber,
          Tradestyle: payloadOrData.Tradestyle,
          NaicsCode: payloadOrData.NaicsCode,
          NaicsDesc: payloadOrData.NaicsDesc,
          YearStarted: payloadOrData.YearStarted,
          SicDesc: payloadOrData.SicDesc,
          DandbCompanyId: payloadOrData.DandbCompanyId,
          OperatingHoursId: payloadOrData.OperatingHoursId,
          synckarma103__NetSuite_Customer_ID__c: payloadOrData.synckarma103__NetSuite_Customer_ID__c,
          synckarma103__Requires_NetSuite_Customer_Mapping__c: payloadOrData.synckarma103__Requires_NetSuite_Customer_Mapping__c
        }
      : payloadOrData;
    this.Name = accountData.Name ?? null;
    this.Type = accountData.Type ?? null;
    this.ParentId = accountData.ParentId ?? null;
    this.BillingAddress = accountData.BillingAddress ?? null;
    this.ShippingAddress = accountData.ShippingAddress ?? null;
    this.Phone = accountData.Phone ?? null;
    this.Fax = accountData.Fax ?? null;
    this.AccountNumber = accountData.AccountNumber ?? null;
    this.Website = accountData.Website ?? null;
    this.Sic = accountData.Sic ?? null;
    this.Industry = accountData.Industry ?? null;
    this.AnnualRevenue = accountData.AnnualRevenue ?? null;
    this.NumberOfEmployees = accountData.NumberOfEmployees ?? null;
    this.Ownership = accountData.Ownership ?? null;
    this.TickerSymbol = accountData.TickerSymbol ?? null;
    this.Description = accountData.Description ?? null;
    this.Rating = accountData.Rating ?? null;
    this.Site = accountData.Site ?? null;
    this.OwnerId = accountData.OwnerId ?? null;
    this.CreatedDate = accountData.CreatedDate ?? null;
    this.CreatedById = accountData.CreatedById ?? null;
    this.LastModifiedDate = accountData.LastModifiedDate ?? null;
    this.LastModifiedById = accountData.LastModifiedById ?? null;
    this.Jigsaw = accountData.Jigsaw ?? null;
    this.JigsawCompanyId = accountData.JigsawCompanyId ?? null;
    this.CleanStatus = accountData.CleanStatus ?? null;
    this.AccountSource = accountData.AccountSource ?? null;
    this.DunsNumber = accountData.DunsNumber ?? null;
    this.Tradestyle = accountData.Tradestyle ?? null;
    this.NaicsCode = accountData.NaicsCode ?? null;
    this.NaicsDesc = accountData.NaicsDesc ?? null;
    this.YearStarted = accountData.YearStarted ?? null;
    this.SicDesc = accountData.SicDesc ?? null;
    this.DandbCompanyId = accountData.DandbCompanyId ?? null;
    this.OperatingHoursId = accountData.OperatingHoursId ?? null;
    this.synckarma103__NetSuite_Customer_ID__c = accountData.synckarma103__NetSuite_Customer_ID__c ?? null;
    this.synckarma103__Requires_NetSuite_Customer_Mapping__c = accountData.synckarma103__Requires_NetSuite_Customer_Mapping__c ?? null;
  }

  /**
   * Fetches full account data from Salesforce REST API
   * @param accountId - Salesforce Account record ID
   * @returns Account instance
   */
  static async getAccount(accountId: string): Promise<Account> {
    if (!accountId) {
      throw new Error('Account ID is required to fetch account');
    }

    const instanceUrl = process.env.SF_INSTANCE_URL;
    const accessToken = process.env.SF_ACCESS_TOKEN;

    if (!instanceUrl || !accessToken) {
      throw new Error('SF_INSTANCE_URL and SF_ACCESS_TOKEN environment variables are required');
    }

    // Build the Salesforce REST API URL
    const apiUrl = `${instanceUrl}/services/data/v58.0/sobjects/Account/${accountId}`;

    // Fetch account data from Salesforce
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch account from Salesforce: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const accountData = (await response.json()) as any;

    // Map Salesforce response to Account format
    const billingAddress: Address | null = {
          Street: accountData.BillingStreet ?? null,
          City: accountData.BillingCity ?? null,
          State: accountData.BillingState ?? null,
          PostalCode: accountData.BillingPostalCode ?? null,
          Country: accountData.BillingCountry ?? null,
          Latitude: accountData.BillingLatitude ?? null,
          Longitude: accountData.BillingLongitude ?? null,
          GeocodeAccuracy: accountData.BillingGeocodeAccuracy ?? null
        };

    const shippingAddress: Address | null = 
     {
          Street: accountData.ShippingStreet ?? null,
          City: accountData.ShippingCity ?? null,
          State: accountData.ShippingState ?? null,
          PostalCode: accountData.ShippingPostalCode ?? null,
          Country: accountData.ShippingCountry ?? null,
          Latitude: accountData.ShippingLatitude ?? null,
          Longitude: accountData.ShippingLongitude ?? null,
          GeocodeAccuracy: accountData.ShippingGeocodeAccuracy ?? null
        };

    return new Account({
      Name: accountData.Name ?? null,
      Type: accountData.Type ?? null,
      ParentId: accountData.ParentId ?? null,
      BillingAddress: billingAddress,
      ShippingAddress: shippingAddress,
      Phone: accountData.Phone ?? null,
      Fax: accountData.Fax ?? null,
      AccountNumber: accountData.AccountNumber ?? null,
      Website: accountData.Website ?? null,
      Sic: accountData.Sic ?? null,
      Industry: accountData.Industry ?? null,
      AnnualRevenue: accountData.AnnualRevenue ?? null,
      NumberOfEmployees: accountData.NumberOfEmployees ?? null,
      Ownership: accountData.Ownership ?? null,
      TickerSymbol: accountData.TickerSymbol ?? null,
      Description: accountData.Description ?? null,
      Rating: accountData.Rating ?? null,
      Site: accountData.Site ?? null,
      OwnerId: accountData.OwnerId ?? null,
      CreatedDate: accountData.CreatedDate ? new Date(accountData.CreatedDate).getTime() : null,
      CreatedById: accountData.CreatedById ?? null,
      LastModifiedDate: accountData.LastModifiedDate ? new Date(accountData.LastModifiedDate).getTime() : null,
      LastModifiedById: accountData.LastModifiedById ?? null,
      Jigsaw: accountData.Jigsaw ?? null,
      JigsawCompanyId: accountData.JigsawCompanyId ?? null,
      CleanStatus: accountData.CleanStatus ?? null,
      AccountSource: accountData.AccountSource ?? null,
      DunsNumber: accountData.DunsNumber ?? null,
      Tradestyle: accountData.Tradestyle ?? null,
      NaicsCode: accountData.NaicsCode ?? null,
      NaicsDesc: accountData.NaicsDesc ?? null,
      YearStarted: accountData.YearStarted ?? null,
      SicDesc: accountData.SicDesc ?? null,
      DandbCompanyId: accountData.DandbCompanyId ?? null,
      OperatingHoursId: accountData.OperatingHoursId ?? null,
      synckarma103__NetSuite_Customer_ID__c: accountData.synckarma103__NetSuite_Customer_ID__c ?? null,
      synckarma103__Requires_NetSuite_Customer_Mapping__c: accountData.synckarma103__Requires_NetSuite_Customer_Mapping__c ?? null
    });
  }
}
