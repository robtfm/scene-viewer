import { type Color4 } from '@dcl/sdk/math'
import ReactEcs, {
  type Callback,
  UiEntity,
  type UiTransformProps
} from '@dcl/sdk/react-ecs'
import { type AtlasIcon } from '../atlas'
import { BLACK_TRANSPARENT, SELECTED_BUTTON_COLOR } from '../constants'
import { Icon } from './icon'

type Props = {
  icon: AtlasIcon
  size: number
  uiTransform?: UiTransformProps
  onMouseDown?: Callback
  onMouseEnter?: Callback
  onMouseLeave?: Callback
  highlighted?: boolean
  iconColor?: Color4
}

export function ButtonIcon({
  icon,
  size,
  uiTransform,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
  highlighted = false,
  iconColor
}: Props): ReactEcs.JSX.Element {
  return (
    <UiEntity
      uiTransform={{
        width: size,
        height: size,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: size * 0.25,
        ...uiTransform
      }}
      uiBackground={{
        color: highlighted ? SELECTED_BUTTON_COLOR : BLACK_TRANSPARENT
      }}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Icon icon={icon} iconSize={size * 0.7} iconColor={iconColor} />
    </UiEntity>
  )
}
