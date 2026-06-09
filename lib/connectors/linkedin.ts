// LinkedIn connector — STUB
//
// IMPORTANT: LinkedIn HTML scraping is PROHIBITED by LinkedIn's User Agreement
// Section 8.2. Automated login / session reuse also violates the ToS.
//
// This connector will only be activated via:
//   a) LinkedIn's official Partner API (requires approved partner application), OR
//   b) A licensed data provider holding a valid LinkedIn data-license agreement.
//
// TODO:
//  1. Apply for LinkedIn Marketing API partner access (marketing.linkedin.com).
//  2. Implement OAuth 2.0 flow for the authorized app.
//  3. Set LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, LINKEDIN_ACCESS_TOKEN in env.
//  4. Replace stub below with People/Company Search API calls.

import { BaseConnector, ConnectorResult } from './base'

export class LinkedInConnector extends BaseConnector {
  readonly name = 'linkedin'
  readonly legalBasis = 'linkedin_official_api_or_licensed_provider'

  async run(): Promise<ConnectorResult> {
    return {
      added: 0, updated: 0, skipped: 0, failed: 0,
      errors: [
        'LinkedIn connector is stubbed. No automated scraping is performed. ' +
        'Activate only via official LinkedIn API or a licensed provider.',
      ],
    }
  }
}

export const LINKEDIN_CONFIGURED = !!(
  process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_ACCESS_TOKEN
)
