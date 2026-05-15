import { executeTask } from '@dcl/sdk/ecs'
import { type Vector3 } from '@dcl/sdk/math'
import { BevyApi } from './bevy-api'
import { sleep } from './utils'

const POLL_MS = 500

const state: { title: string | null; parcel: { x: number; y: number } | null } =
  {
    title: null,
    parcel: null
  }

const subscribers = new Set<() => void>()

export function getCurrentSceneTitle(): string | null {
  return state.title
}

export function getCurrentParcel(): { x: number; y: number } | null {
  return state.parcel
}

export function subscribeCurrentScene(fn: () => void): () => void {
  subscribers.add(fn)
  return () => {
    subscribers.delete(fn)
  }
}

function notify(): void {
  for (const fn of subscribers) fn()
}

let started = false

// Looks up the scene at the player's *spawn* parcel and re-polls until
// liveSceneInfo() reports it. Scene-viewer parks the player at y=10k so
// we deliberately ignore the camera here.
export function startCurrentSceneTracker(originPos: Vector3): void {
  if (started) return
  started = true
  state.parcel = {
    x: Math.floor(originPos.x / 16),
    y: Math.floor(originPos.z / 16)
  }
  notify()
  executeTask(async () => {
    while (state.title === null) {
      try {
        const scenes = await BevyApi.liveSceneInfo()
        for (const scene of scenes) {
          if (scene.isPortable) continue
          if (
            scene.parcels.some(
              (p) => p.x === state.parcel?.x && p.y === state.parcel?.y
            )
          ) {
            state.title = scene.title
            notify()
            break
          }
        }
      } catch (e) {
        console.error('current-scene tracker', e)
      }
      if (state.title === null) await sleep(POLL_MS)
    }
  })
}
