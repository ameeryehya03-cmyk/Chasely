import { createServerClient } from '../supabase'

export interface ConnectorResult {
  added: number
  updated: number
  skipped: number
  failed: number
  errors: string[]
}

export abstract class BaseConnector {
  abstract readonly name: string
  abstract readonly legalBasis: string

  protected supabase = createServerClient()

  abstract run(params?: Record<string, unknown>): Promise<ConnectorResult>

  protected async startRun(params?: Record<string, unknown>): Promise<string> {
    const { data, error } = await this.supabase
      .from('connector_runs')
      .insert({ connector: this.name, status: 'running', params: params ?? null })
      .select('id')
      .single()
    if (error) throw error
    return data.id
  }

  protected async finishRun(runId: string, result: ConnectorResult): Promise<void> {
    await this.supabase.from('connector_runs').update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      records_added: result.added,
      records_updated: result.updated,
      records_skipped: result.skipped,
      records_failed: result.failed,
      error_message: result.errors.length ? result.errors.slice(0, 5).join('\n') : null,
    }).eq('id', runId)
  }

  protected async failRun(runId: string, error: string): Promise<void> {
    await this.supabase.from('connector_runs').update({
      status: 'failed',
      completed_at: new Date().toISOString(),
      error_message: error,
    }).eq('id', runId)
  }
}
