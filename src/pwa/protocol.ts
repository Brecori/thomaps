export type OfflineReadiness =
  'preparing' | 'ready' | 'incomplete' | 'error' | 'unavailable'
export type PwaReply =
  | { type: 'OFFLINE_STATUS'; ready: boolean; missing: number; version: string }
  | { type: 'UPDATE_ACCEPTED' }
  | { type: 'ERROR'; reason: 'storage' | 'network' | 'other-tabs' }
export type PwaRequest = {
  type: 'CHECK_OFFLINE' | 'REPAIR_OFFLINE' | 'APPLY_UPDATE'
}

export function isPwaReply(value: unknown): value is PwaReply {
  if (!value || typeof value !== 'object' || !('type' in value)) return false
  if (value.type === 'UPDATE_ACCEPTED') return true
  if (value.type === 'ERROR')
    return (
      'reason' in value &&
      ['storage', 'network', 'other-tabs'].includes(String(value.reason))
    )
  return (
    value.type === 'OFFLINE_STATUS' &&
    'ready' in value &&
    typeof value.ready === 'boolean' &&
    'missing' in value &&
    typeof value.missing === 'number' &&
    'version' in value &&
    typeof value.version === 'string'
  )
}
