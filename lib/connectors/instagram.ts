// Instagram connector — STUB
//
// IMPORTANT: Scraping instagram.com (consumer site) is prohibited by Meta's
// Terms of Use Section 3.2 and the Computer Fraud and Abuse Act.
//
// This connector will only be activated via:
//   a) Instagram Graph API (Business/Creator accounts) using Meta-approved access, OR
//   b) A Meta-licensed data partner.
//
// Data captured when live: handle, follower count, bio, public contact button (email/phone).
//
// TODO:
//  1. Create a Meta Business App at developers.facebook.com.
//  2. Request instagram_basic + instagram_manage_insights permissions.
//  3. Set INSTAGRAM_APP_ID, INSTAGRAM_APP_SECRET, INSTAGRAM_ACCESS_TOKEN in env.
//  4. Implement Graph API calls below.

import { BaseConnector, ConnectorResult } from './base'

export class InstagramConnector extends BaseConnector {
  readonly name = 'instagram'
  readonly legalBasis = 'instagram_graph_api_tos'

  async run(): Promise<ConnectorResult> {
    return {
      added: 0, updated: 0, skipped: 0, failed: 0,
      errors: [
        'Instagram connector is stubbed. No scraping is performed. ' +
        'Activate only via the official Instagram Graph API.',
      ],
    }
  }
}

export const INSTAGRAM_CONFIGURED = !!(
  process.env.INSTAGRAM_APP_ID && process.env.INSTAGRAM_ACCESS_TOKEN
)
