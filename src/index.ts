import { engine, executeTask, Transform } from '@dcl/sdk/ecs'
import { getPlayer } from '@dcl/sdk/players'
import { Vector3 } from '@dcl/sdk/math'
import { BevyApi } from './bevy-api'
import { installFlyCamera } from './fly-camera'
import { applyExplorerSettings } from './explorer-settings'
import { hideOwnAvatar } from './hide-avatars'
import { waitFor } from './utils'

const nativeLog = console.log
console.log = (...args: unknown[]) => {
  nativeLog('[scene-viewer]', ...args)
}

export function main(): void {
  executeTask(async () => {
    try {
      console.log('booting')

      BevyApi.loginGuest()

      const player = await waitFor(() => getPlayer())
      console.log('player ready', player?.userId, 'guest:', player?.isGuest)

      hideOwnAvatar()
      applyExplorerSettings().catch((e) => {
        console.error('applyExplorerSettings failed', e)
      })

      const playerPos = Transform.getOrNull(engine.PlayerEntity)?.position
      const start = playerPos
        ? Vector3.add(playerPos, Vector3.create(0, 1.6, 0))
        : Vector3.create(8, 2, 8)
      installFlyCamera(start)

      // TODO #5: render display-only nearby chat
      // TODO #6: render Audio + Graphics settings panel

      console.log('boot complete')
    } catch (e) {
      console.error('boot failed', e)
    }
  })
}
