import {
  AvatarModifierArea,
  AvatarModifierType,
  engine
} from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'

export function hideOwnAvatar(): void {
  AvatarModifierArea.createOrReplace(engine.PlayerEntity, {
    area: Vector3.create(0.01, 0.01, 0.01),
    modifiers: [AvatarModifierType.AMT_HIDE_AVATARS],
    excludeIds: []
  })
}
