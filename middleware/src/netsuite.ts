import { Account } from './account';
import { logger } from './logger';

/**
 * NetSuite integration utilities
 */
export class NetSuite {
  private readonly netSuiteAPI: NetSuiteAPI;

  constructor(netSuiteAPI?: NetSuiteAPI) {
    this.netSuiteAPI = netSuiteAPI ?? new NetSuiteAPI();
  }

  /**
   * Returns a JSON payload representing the likely NetSuite customer matches
   * for the provided Salesforce Account.
   */
  async getCustomerLikelyMatches(account: Account, accountId?: string): Promise<string> {
    if (!account) {
      throw new Error('Account is required to retrieve NetSuite matches.');
    }

    const accountName = account.Name ?? '';
    const billingZip = account.BillingAddress?.PostalCode ?? '';
    const phone = account.Phone ?? '';
    logger.debug({ 
      accountId, 
      accountName, 
      billingZip, 
      phone 
    }, 'Getting NetSuite customer likely matches for account');

    const matchesJSON = await this.netSuiteAPI.getCustomerLikelyMatches(
      accountId ?? '',
      accountName,
      billingZip,
      phone
    );

    logger.debug({ matchesJSON }, 'Matches JSON');

    return matchesJSON;
  }
}

/**
 * Thin wrapper responsible for communicating with NetSuite.
 * Currently returns mock data but can be extended to make real HTTP calls.
 */
export class NetSuiteAPI {
  constructor(
    private readonly baseUrl: string = process.env.NETSUITE_BASE_URL ?? '',
    private readonly token: string = process.env.NETSUITE_TOKEN ?? ''
  ) {}

  async getCustomerLikelyMatches(
    accountId: string,
    accountName: string,
    billingZip: string,
    phone: string
  ): Promise<string> {
    // TODO: Replace this mock implementation with a real NetSuite lookup.
    const mockMatchesJSON = `
{
  "accountId": "${accountId}",
  "searchedFields": {
    "name": "${accountName}",
    "postalCode": "${billingZip}",
    "phone": "${phone}"
  },
  "candidates": [
    {
      "internalId": "12345",
      "entityId": "Acme Corp",
      "isInactive": false,
      "confidence": 0.92,
      "matchReasons": [
        { "field": "name", "score": 0.94, "detail": "Fuzzy match: 'Acme' ≈ 'Acme'" },
        { "field": "postalCode", "score": 1.0, "detail": "Exact match" }
      ],
      "address": {
        "line1": "123 Main Street",
        "city": "Boston",
        "state": "MA",
        "postalCode": "12345",
        "country": "US"
      },
      "phone": "999-999-9999"
    },
    {
      "internalId": "98765",
      "entityId": "ACME Corporation - East",
      "isInactive": false,
      "confidence": 0.81,
      "matchReasons": [
        { "field": "name", "score": 0.84 },
        { "field": "postalCode", "score": 1.0 }
      ],
      "address": {
        "line1": "100 Industrial Road",
        "city": "Boston",
        "state": "MA",
        "postalCode": "12345",
        "country": "US"
      },
      "phone": "888-888-8888"
    }
  ]
}
`;

    return mockMatchesJSON;
  }
}