// Contact Enrichment connector — STUB
//
// TODO: Plug in a licensed B2B data provider that warrants consented,
// lawfully-sourced data (e.g. Apollo.io, Hunter.io, Clearbit, or a
// UAE-specific provider holding the appropriate data-processing license).
//
// Requirements before enabling:
//  1. Obtain the provider's Data Processing Agreement (DPA).
//  2. Confirm their license covers UAE PDPL marketing use.
//  3. Set ENRICHMENT_PROVIDER_API_KEY + ENRICHMENT_PROVIDER_BASE_URL in env.
//  4. Replace the stub implementation below with real API calls.
//
// Legal basis when live: 'licensed_b2b_data_provider' + provider name + license ref.

import { BaseConnector, ConnectorResult } from './base'

export class EnrichmentConnector extends BaseConnector {
  readonly name = 'enrichment'
  readonly legalBasis = 'licensed_b2b_data_provider'

  async run(): Promise<ConnectorResult> {
    const result: ConnectorResult = { added: 0, updated: 0, skipped: 0, failed: 0, errors: [] }
    result.errors.push(
      'Enrichment connector is not configured. ' +
      'Add ENRICHMENT_PROVIDER_API_KEY to env and implement the connector.'
    )
    return result
  }
}

export const ENRICHMENT_CONFIGURED = !!(
  process.env.ENRICHMENT_PROVIDER_API_KEY &&
  process.env.ENRICHMENT_PROVIDER_BASE_URL
)
