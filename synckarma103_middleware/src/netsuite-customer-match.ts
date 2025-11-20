/**
 * NetSuite_Customer_Match__c Salesforce custom object representation
 * Used to create and manage NetSuite customer match records in Salesforce
 */

export type Decision = 'Use Existing' | 'Create New';

export type Status =
  | 'Pending Middleware' // waiting for middleware to suggest matches
  | 'Pending Review' // waiting for human review
  | 'Approved – Use Existing' // approved and using existing NetSuite customer
  | 'Approved – Create New' // approved and creating new NetSuite customer
  | 'Completed' // match completed and no action needed
  | 'Error' // error occurred while matching

export interface NetSuiteCustomerMatchData {
  Account__c: string; // Required: MasterDetail relationship to Account
  Correlation_Id__c?: string | null;
  Decision__c?: Decision | null;
  Reason__c?: string | null;
  Resolved_At__c?: string | null; // ISO 8601 DateTime string
  Selected_NetSuite_Internal_ID__c?: string | null;
  Status__c?: Status | null;
  Suggested_At__c?: string | null; // ISO 8601 DateTime string
  Suggested_Matches_JSON__c?: string | null;
}

export class NetSuiteCustomerMatch {
  public readonly Account__c: string;
  public readonly Correlation_Id__c: string | null;
  public readonly Decision__c: Decision | null;
  public readonly Reason__c: string | null;
  public readonly Resolved_At__c: string | null;
  public readonly Selected_NetSuite_Internal_ID__c: string | null;
  public readonly Status__c: Status | null;
  public readonly Suggested_At__c: string | null;
  public readonly Suggested_Matches_JSON__c: string | null;
  private readonly namespace: string;

  constructor(accountId: string, likelyMatchesJSON: string, namespace?: string);
  constructor(data: NetSuiteCustomerMatchData, namespace?: string);
  constructor(accountIdOrData: string | NetSuiteCustomerMatchData, likelyMatchesJSONOrNamespace?: string, namespace?: string) {
    // Determine namespace and handle constructor logic
    if (typeof accountIdOrData === 'string' && typeof likelyMatchesJSONOrNamespace === 'string') {
      // Two-parameter constructor: (accountId, likelyMatchesJSON, namespace?)
      this.namespace = namespace ?? '';
      if (!accountIdOrData) {
        throw new Error('Account ID is required to create NetSuite_Customer_Match record');
      }
      
      this.Account__c = accountIdOrData;
      this.Suggested_Matches_JSON__c = likelyMatchesJSONOrNamespace;
      this.Status__c = 'Pending Review';
      this.Suggested_At__c = NetSuiteCustomerMatch.formatDateTime(new Date());
      this.Correlation_Id__c = null;
      this.Decision__c = null;
      this.Reason__c = null;
      this.Resolved_At__c = null;
      this.Selected_NetSuite_Internal_ID__c = null;
    } else {
      // Use the NetSuiteCustomerMatchData constructor: (data, namespace?)
      // In this case, likelyMatchesJSONOrNamespace is the namespace parameter
      this.namespace = (typeof likelyMatchesJSONOrNamespace === 'string' ? likelyMatchesJSONOrNamespace : '') ?? '';
      const data = accountIdOrData as NetSuiteCustomerMatchData;
      if (!data.Account__c) {
        throw new Error('Account__c is required to create NetSuite_Customer_Match record');
      }

      this.Account__c = data.Account__c;
      this.Correlation_Id__c = data.Correlation_Id__c ?? null;
      this.Decision__c = data.Decision__c ?? null;
      this.Reason__c = data.Reason__c ?? null;
      this.Resolved_At__c = data.Resolved_At__c ?? null;
      this.Selected_NetSuite_Internal_ID__c = data.Selected_NetSuite_Internal_ID__c ?? null;
      this.Status__c = data.Status__c ?? null;
      this.Suggested_At__c = data.Suggested_At__c ?? null;
      this.Suggested_Matches_JSON__c = data.Suggested_Matches_JSON__c ?? null;
    }
  }

  /**
   * Adds namespace prefix to a field name for Salesforce API
   */
  private addNamespace(fieldName: string): string {
    if (!this.namespace) {
      return fieldName;
    }
    // Only add namespace to custom fields (ending with __c)
    // Standard fields like Id don't get namespaced
    if (fieldName.endsWith('__c')) {
      return `${this.namespace}${fieldName}`;
    }
    return fieldName;
  }

  /**
   * Converts the instance to a Salesforce API payload
   * Excludes null values to avoid sending unnecessary data
   * Field names are prefixed with namespace when sending to Salesforce
   */
  toSalesforcePayload(): Record<string, any> {
    const payload: Record<string, any> = {
      [this.addNamespace('Account__c')]: this.Account__c
    };

    if (this.Correlation_Id__c !== null) {
      payload[this.addNamespace('Correlation_Id__c')] = this.Correlation_Id__c;
    }
    if (this.Decision__c !== null) {
      payload[this.addNamespace('Decision__c')] = this.Decision__c;
    }
    if (this.Reason__c !== null) {
      payload[this.addNamespace('Reason__c')] = this.Reason__c;
    }
    if (this.Resolved_At__c !== null) {
      payload[this.addNamespace('Resolved_At__c')] = this.Resolved_At__c;
    }
    if (this.Selected_NetSuite_Internal_ID__c !== null) {
      payload[this.addNamespace('Selected_NetSuite_Internal_ID__c')] = this.Selected_NetSuite_Internal_ID__c;
    }
    if (this.Status__c !== null) {
      payload[this.addNamespace('Status__c')] = this.Status__c;
    }
    if (this.Suggested_At__c !== null) {
      payload[this.addNamespace('Suggested_At__c')] = this.Suggested_At__c;
    }
    if (this.Suggested_Matches_JSON__c !== null) {
      payload[this.addNamespace('Suggested_Matches_JSON__c')] = this.Suggested_Matches_JSON__c;
    }

    return payload;
  }

  /**
   * Creates a NetSuite_Customer_Match__c record in Salesforce
   * @returns The created record ID
   */
  async createInSalesforce(): Promise<string> {
    const instanceUrl = process.env.SF_INSTANCE_URL;
    const accessToken = process.env.SF_ACCESS_TOKEN;

    if (!instanceUrl || !accessToken) {
      throw new Error('SF_INSTANCE_URL and SF_ACCESS_TOKEN environment variables are required');
    }

    // Build the Salesforce REST API URL with namespace prefix
    const objectName = this.namespace 
      ? `${this.namespace}NetSuite_Customer_Match__c`
      : 'NetSuite_Customer_Match__c';
    const apiUrl = `${instanceUrl}/services/data/v58.0/sobjects/${objectName}`;

    // Convert to Salesforce payload
    const payload = this.toSalesforcePayload();

    // Create record in Salesforce
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to create NetSuite_Customer_Match record in Salesforce: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const result = (await response.json()) as { id: string; success: boolean; errors?: string[] };
    
    if (!result.success) {
      throw new Error(
        `Failed to create NetSuite_Customer_Match record: ${result.errors?.join(', ') || 'Unknown error'}`
      );
    }

    return result.id;
  }

  /**
   * Helper method to format a Date to ISO 8601 string for Salesforce DateTime fields
   */
  static formatDateTime(date: Date): string {
    return date.toISOString();
  }
}

