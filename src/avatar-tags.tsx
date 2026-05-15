import {
  AvatarAnchorPointType,
  AvatarAttach,
  Billboard,
  engine,
  type Entity,
  Material,
  MaterialTransparencyMode,
  MeshRenderer,
  PlayerIdentityData,
  Transform,
  UiCanvas,
  VisibilityComponent
} from '@dcl/sdk/ecs'
import { Color4, Vector3 } from '@dcl/sdk/math'
import { getPlayer, onEnterScene, onLeaveScene } from '@dcl/sdk/players'
import ReactEcs, { ReactEcsRenderer } from '@dcl/sdk/react-ecs'
import { TagElement } from './components/tag-element'

const MAX_DISTANCE = 32
const MAX_DISTANCE_SQ = MAX_DISTANCE * MAX_DISTANCE
const CULL_INTERVAL = 0.1

const tags = new Map<string, Entity>()

function createTag(userId: string): Entity {
  const entity = engine.addEntity()
  Billboard.create(entity, {})
  MeshRenderer.setPlane(entity)
  Transform.create(entity, { scale: Vector3.create(2, 1, 1) })
  AvatarAttach.create(entity, {
    avatarId: userId,
    anchorPointId: AvatarAnchorPointType.AAPT_NAME_TAG
  })
  UiCanvas.create(entity, {
    width: 400,
    height: 200,
    color: Color4.Clear()
  })
  ReactEcsRenderer.setTextureRenderer(entity, () => (
    <TagElement userId={userId} />
  ))
  Material.setPbrMaterial(entity, {
    transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND,
    texture: {
      tex: { $case: 'uiTexture', uiTexture: { uiCanvasEntity: entity } }
    },
    emissiveTexture: {
      tex: { $case: 'uiTexture', uiTexture: { uiCanvasEntity: entity } }
    },
    emissiveColor: Color4.White(),
    emissiveIntensity: 0.2
  })
  return entity
}

function destroyTag(userId: string): void {
  const entity = tags.get(userId)
  if (entity === undefined) return
  engine.removeEntityWithChildren(entity)
  tags.delete(userId)
}

let cullTimer = 0
function cullSystem(dt: number): void {
  cullTimer += dt
  if (cullTimer < CULL_INTERVAL) return
  cullTimer = 0

  const cam = Transform.getOrNull(engine.CameraEntity)
  if (cam === null) return
  const camFwd = Vector3.rotate(Vector3.Forward(), cam.rotation)

  for (const tagEntity of tags.values()) {
    const tagPos = Transform.getOrNull(tagEntity)?.position
    let visible = false
    if (tagPos) {
      const d = Vector3.subtract(tagPos, cam.position)
      if (Vector3.lengthSquared(d) < MAX_DISTANCE_SQ && Vector3.dot(d, camFwd) > 0) {
        visible = true
      }
    }
    if (visible) {
      VisibilityComponent.deleteFrom(tagEntity)
    } else {
      VisibilityComponent.createOrReplace(tagEntity, { visible: false })
    }
  }
}

export function installAvatarTags(): void {
  const localUserId = getPlayer()?.userId
  for (const [, data] of engine.getEntitiesWith(PlayerIdentityData)) {
    if (data.address === localUserId) continue
    if (tags.has(data.address)) continue
    tags.set(data.address, createTag(data.address))
  }
  onEnterScene((player) => {
    if (player.userId === getPlayer()?.userId) return
    if (tags.has(player.userId)) return
    tags.set(player.userId, createTag(player.userId))
  })
  onLeaveScene((userId) => {
    destroyTag(userId)
  })
  engine.addSystem(cullSystem)
}
