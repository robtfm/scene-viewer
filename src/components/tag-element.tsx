import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'
import {
  getAddressColor,
  UNCLAIMED_NAME_COLOR
} from '../profile/color-by-address'
import {
  ensureProfileLoaded,
  getDisplayName,
  hasClaimedName,
  onProfileUpdate
} from '../profile/profile-service'
import { Icon } from './icon'

const NAME_FONT_SIZE = 28
const ICON_SIZE = 28

export function TagElement({
  userId
}: {
  userId: string
}): ReactEcs.JSX.Element {
  const [, setTick] = ReactEcs.useState(0)
  ReactEcs.useEffect(() => {
    ensureProfileLoaded(userId)
    const unsub = onProfileUpdate((id) => {
      if (id === userId) setTick((t) => t + 1)
    })
    return unsub
  }, [])

  const claimed = hasClaimedName(userId)
  const color = claimed ? getAddressColor(userId) : UNCLAIMED_NAME_COLOR
  const name = getDisplayName(userId)

  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        justifyContent: 'center',
        alignSelf: 'center'
      }}
    >
      <UiEntity
        uiTransform={{
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 16,
          padding: { top: 6, bottom: 6, left: 14, right: 14 }
        }}
        uiBackground={{ color: { r: 0, g: 0, b: 0, a: 0.7 } }}
      >
        <UiEntity
          uiTransform={{ width: 'auto', height: NAME_FONT_SIZE + 8 }}
          uiText={{
            value: `<b>${name}</b>`,
            fontSize: NAME_FONT_SIZE,
            color,
            textAlign: 'middle-left',
            outlineColor: Color4.White(),
            outlineWidth: 0.1
          }}
        />
        {claimed && (
          <Icon
            icon={{ atlasName: 'icons', spriteName: 'Verified' }}
            iconSize={ICON_SIZE}
            uiTransform={{ margin: { left: 6 } }}
          />
        )}
      </UiEntity>
    </UiEntity>
  )
}
