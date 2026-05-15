import { engine, executeTask, Transform } from '@dcl/sdk/ecs'
import { getPlayer } from '@dcl/sdk/players'
import { Vector3 } from '@dcl/sdk/math'
import { movePlayerTo } from '~system/RestrictedActions'
import { BevyApi } from './bevy-api'
import { installFlyCamera } from './fly-camera'
import { installAvatarTags } from './avatar-tags'
import { startCurrentSceneTracker } from './current-scene'
import { applyExplorerSettings } from './explorer-settings'
import { hideOwnAvatar } from './hide-avatars'
import { installUi } from './ui'
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

      const originalPos =
        Transform.getOrNull(engine.PlayerEntity)?.position ?? Vector3.Zero()
      // Don't go too high — bevy-explorer's get_ray uses a fixed 0.01
      // f32 nudge that's lost to precision past ~40k, causing an
      // infinite loop in scene raycasts against the player position.
      movePlayerTo({
        newRelativePosition: Vector3.create(originalPos.x, 10_000, originalPos.z)
      }).catch((e) => {
        console.error('movePlayerTo failed', e)
      })
      installFlyCamera({
        position: Vector3.add(originalPos, Vector3.create(8, 4, 6)),
        lookAt: Vector3.add(originalPos, Vector3.create(0, 1, 0))
      })
      startCurrentSceneTracker(originalPos)
      installAvatarTags()
      installUi()

      // TODO #6: render Audio + Graphics settings panel

      console.log('boot complete')
    } catch (e) {
      console.error('boot failed', e)
    }
  })
}
