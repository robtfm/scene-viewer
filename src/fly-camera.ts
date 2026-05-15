import {
  engine,
  type Entity,
  InputAction,
  inputSystem,
  MainCamera,
  PointerLock,
  PrimaryPointerInfo,
  Transform,
  VirtualCamera
} from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'

const MOUSE_SENSITIVITY = 0.005
const MOVE_SPEED = 8
const PITCH_LIMIT = Math.PI / 2 - 0.01
const RAD_TO_DEG = 180 / Math.PI

const state = {
  cameraEntity: 0 as Entity,
  yaw: 0,
  pitch: 0
}

export function installFlyCamera(startPosition: Vector3): void {
  const cam = engine.addEntity()
  state.cameraEntity = cam

  Transform.create(cam, { position: startPosition })
  VirtualCamera.create(cam, {})
  MainCamera.createOrReplace(engine.CameraEntity, {
    virtualCameraEntity: cam
  })

  engine.addSystem(flyCameraSystem)
}

function flyCameraSystem(dt: number): void {
  const cam = state.cameraEntity
  if (!cam) return

  const locked =
    PointerLock.getOrNull(engine.CameraEntity)?.isPointerLocked ?? false

  if (locked) {
    const pointer = PrimaryPointerInfo.getOrNull(engine.RootEntity)
    const dx = pointer?.screenDelta?.x ?? 0
    const dy = pointer?.screenDelta?.y ?? 0
    state.yaw += dx * MOUSE_SENSITIVITY
    state.pitch += dy * MOUSE_SENSITIVITY
    if (state.pitch > PITCH_LIMIT) state.pitch = PITCH_LIMIT
    if (state.pitch < -PITCH_LIMIT) state.pitch = -PITCH_LIMIT
  }

  const yawQ = Quaternion.fromAngleAxis(state.yaw * RAD_TO_DEG, Vector3.Up())
  const pitchQ = Quaternion.fromAngleAxis(
    state.pitch * RAD_TO_DEG,
    Vector3.Right()
  )
  const rotation = Quaternion.multiply(yawQ, pitchQ)

  const forward = Vector3.rotate(Vector3.Forward(), rotation)
  const right = Vector3.rotate(Vector3.Right(), rotation)
  const up = Vector3.Up()

  let move = Vector3.Zero()
  if (inputSystem.isPressed(InputAction.IA_FORWARD)) {
    move = Vector3.add(move, forward)
  }
  if (inputSystem.isPressed(InputAction.IA_BACKWARD)) {
    move = Vector3.subtract(move, forward)
  }
  if (inputSystem.isPressed(InputAction.IA_RIGHT)) {
    move = Vector3.add(move, right)
  }
  if (inputSystem.isPressed(InputAction.IA_LEFT)) {
    move = Vector3.subtract(move, right)
  }
  if (inputSystem.isPressed(InputAction.IA_JUMP)) {
    move = Vector3.add(move, up)
  }
  if (inputSystem.isPressed(InputAction.IA_WALK)) {
    move = Vector3.subtract(move, up)
  }

  if (Vector3.lengthSquared(move) > 1e-6) {
    move = Vector3.scale(Vector3.normalize(move), MOVE_SPEED * dt)
  }

  const transform = Transform.getMutable(cam)
  transform.position = Vector3.add(transform.position, move)
  transform.rotation = rotation
}
