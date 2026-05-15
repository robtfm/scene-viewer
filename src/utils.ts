import { timers } from '@dcl-sdk/utils'

export async function sleep(ms: number): Promise<void> {
  return await new Promise((resolve) =>
    timers.setTimeout(resolve as () => void, ms)
  )
}

export async function waitFor<T>(
  predicate: () => T,
  timeoutMs = 30_000,
  pollMs = 100
): Promise<T> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const value = predicate()
    if (value) return value
    await sleep(pollMs)
  }
  throw new Error('waitFor: timed out')
}
