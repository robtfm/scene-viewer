import { getPlayer } from '@dcl/sdk/players'
import { getRealm } from '~system/Runtime'

const CATALYST_FALLBACK = 'https://peer.decentraland.org'

type ProfileResponse = { timestamp: number; avatars: Array<Record<string, unknown>> }
type NameEntry = { name: string; contractAddress?: string; tokenId?: string }

const profileCache = new Map<string, ProfileResponse | null>()
const namesCache = new Map<string, NameEntry[]>()
const inFlight = new Map<string, Promise<void>>()
const listeners = new Set<(userId: string) => void>()

async function realmBaseUrl(): Promise<string> {
  return (await getRealm({})).realmInfo?.baseUrl ?? CATALYST_FALLBACK
}

async function fetchJsonWithFallback(url: string): Promise<unknown> {
  try {
    return await (await fetch(url)).json()
  } catch {
    const base = await realmBaseUrl()
    const fb = url.replace(base, CATALYST_FALLBACK)
    return await (await fetch(fb)).json()
  }
}

async function fetchProfile(userId: string): Promise<ProfileResponse | null> {
  const base = await realmBaseUrl()
  const res = (await fetchJsonWithFallback(
    `${base}/lambdas/profiles/${userId}`
  )) as ProfileResponse | null
  return res
}

async function fetchNames(userId: string): Promise<NameEntry[]> {
  const base = await realmBaseUrl()
  const res = (await fetchJsonWithFallback(
    `${base}/lambdas/users/${userId}/names`
  )) as { elements?: NameEntry[] } | null
  return res?.elements ?? []
}

export function ensureProfileLoaded(userId: string): void {
  if (!userId) return
  if (profileCache.has(userId) && namesCache.has(userId)) return
  if (inFlight.has(userId)) return
  const load = (async () => {
    try {
      const [profile, names] = await Promise.all([
        fetchProfile(userId).catch((e) => {
          console.log('profile fetch failed', userId, e)
          return null
        }),
        fetchNames(userId).catch((e) => {
          console.log('names fetch failed', userId, e)
          return [] as NameEntry[]
        })
      ])
      profileCache.set(userId, profile)
      namesCache.set(userId, names)
    } finally {
      inFlight.delete(userId)
      for (const fn of listeners) fn(userId)
    }
  })()
  inFlight.set(userId, load)
}

export function hasClaimedName(userId: string): boolean {
  const names = namesCache.get(userId)
  if (!names) return false
  const playerName = getPlayer({ userId })?.name
  if (!playerName) return false
  return names.some((n) => n.name === playerName)
}

function shortAddr(userId: string): string {
  if (userId.length <= 10) return userId
  return `${userId.slice(0, 6)}…${userId.slice(-4)}`
}

export function getDisplayName(userId: string): string {
  const player = getPlayer({ userId })
  const baseName = player?.name ?? shortAddr(userId)
  if (hasClaimedName(userId)) return baseName
  return `${baseName}#${userId.slice(-4).toLowerCase()}`
}

export function onProfileUpdate(
  fn: (userId: string) => void
): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}
