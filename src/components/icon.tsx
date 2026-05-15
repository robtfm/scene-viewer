import { type Color4 } from '@dcl/sdk/math'
import ReactEcs, {
  type PositionUnit,
  UiEntity,
  type UiTransformProps
} from '@dcl/sdk/react-ecs'
import { type AtlasIcon, getBackgroundFromAtlas } from '../atlas'

type IconProps = {
  icon: AtlasIcon
  uiTransform?: UiTransformProps
  iconSize?: PositionUnit
  iconColor?: Color4
}

export function Icon({
  icon,
  uiTransform,
  iconSize,
  iconColor
}: IconProps): ReactEcs.JSX.Element {
  return (
    <UiEntity
      uiTransform={{
        width: iconSize ?? 30,
        height: iconSize ?? 30,
        flexShrink: 0,
        ...uiTransform
      }}
      uiBackground={{
        ...getBackgroundFromAtlas(icon),
        color: iconColor ?? { r: 1, g: 1, b: 1, a: 1 }
      }}
    />
  )
}
