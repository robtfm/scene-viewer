import { type Color4 } from '@dcl/sdk/math'
import ReactEcs, { UiEntity, type UiTransformProps } from '@dcl/sdk/react-ecs'
import { getBackgroundFromAtlas } from '../atlas'
import { ONE_ADDRESS, ZERO_ADDRESS } from '../constants'

type Props = {
  userId: string
  color: Color4 | { r: number; g: number; b: number; a: number }
  size?: number
  isGuest?: boolean
  uiTransform?: UiTransformProps
}

export function AvatarCircle({
  userId,
  color,
  size = 36,
  isGuest = false,
  uiTransform
}: Props): ReactEcs.JSX.Element {
  const isSystem = userId === ZERO_ADDRESS || userId === ONE_ADDRESS
  const borderWidth = Math.max(2, Math.round(size * 0.05))
  const inner = isSystem
    ? getBackgroundFromAtlas({ atlasName: 'icons', spriteName: 'DdlIconColor' })
    : isGuest
      ? {
          ...getBackgroundFromAtlas({
            atlasName: 'icons',
            spriteName: 'Members'
          }),
          color: { r: 1, g: 1, b: 1, a: 0.5 }
        }
      : {
          textureMode: 'stretch' as const,
          avatarTexture: { userId }
        }

  return (
    <UiEntity
      uiTransform={{
        width: size,
        height: size,
        flexShrink: 0,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 999,
        borderWidth,
        borderColor: color as Color4,
        ...uiTransform
      }}
      uiBackground={{ color: { ...color, a: 0.3 } }}
    >
      <UiEntity
        uiTransform={{
          width: '100%',
          height: '100%',
          borderRadius: 999
        }}
        uiBackground={inner}
      />
    </UiEntity>
  )
}
