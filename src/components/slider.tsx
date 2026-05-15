import { engine, PrimaryPointerInfo } from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'
import ReactEcs, {
  type UiBackgroundProps,
  UiEntity,
  type UiTransformProps
} from '@dcl/sdk/react-ecs'
import { BLACK_TRANSPARENT, RED } from '../constants'
import { Icon } from './icon'

const MOUSE_VELOCITY = 0.1

function roundToStep(value: number, stepSize: number): number {
  if (!stepSize) return value
  const decimals = stepSize.toString().split('.')[1]?.length ?? 0
  const rounded = Math.round(value / stepSize) * stepSize
  return parseFloat(rounded.toFixed(decimals))
}

type BasicSliderProps = {
  value: number
  min: number
  max: number
  stepSize: number
  uiTransform: UiTransformProps
  onChange: (value: number) => void
  onRelease: (value: number) => void
  backgroundBar?: Color4
  uiBackground?: UiBackgroundProps
}

function BasicSlider({
  value,
  min,
  max,
  stepSize,
  uiTransform,
  onChange,
  onRelease,
  backgroundBar,
  uiBackground
}: BasicSliderProps): ReactEcs.JSX.Element {
  const range = max - min
  const percentage =
    range === 0 ? 0 : Math.min(100, Math.max(0, ((value - min) / range) * 100))
  const [drag] = ReactEcs.useState<{ rawPercent: number | null }>({
    rawPercent: null
  })

  return (
    <UiEntity uiTransform={uiTransform}>
      {backgroundBar && (
        <UiEntity
          uiTransform={{
            positionType: 'absolute',
            width: '100%',
            height: '70%',
            alignSelf: 'center'
          }}
        >
          <UiEntity
            uiTransform={{
              positionType: 'absolute',
              position: { left: '0%' },
              width: `${percentage}%`,
              height: '100%',
              borderRadius: 8
            }}
            uiBackground={{ color: backgroundBar }}
          />
          <UiEntity
            uiTransform={{
              positionType: 'absolute',
              position: { left: `${percentage}%` },
              width: `${100 - percentage}%`,
              height: '100%',
              borderRadius: 8
            }}
            uiBackground={{
              color: Color4.create(0.5, 0.5, 0.5, 0.5)
            }}
          />
        </UiEntity>
      )}
      <UiEntity
        uiTransform={{ width: '100%', height: '100%' }}
        uiBackground={uiBackground ?? { color: BLACK_TRANSPARENT }}
        onMouseDragLocked={() => {
          const pointer = PrimaryPointerInfo.get(engine.RootEntity)
          const deltaX = pointer?.screenDelta?.x ?? 0
          const basePercent = drag.rawPercent ?? percentage
          const newPercentage = Math.min(
            100,
            Math.max(0, basePercent + deltaX * MOUSE_VELOCITY)
          )
          drag.rawPercent = newPercentage
          const next = roundToStep(min + (newPercentage / 100) * range, stepSize)
          onChange(next)
        }}
        onMouseDragEnd={() => {
          drag.rawPercent = null
          onRelease(value)
        }}
      >
        <UiEntity
          uiTransform={{
            positionType: 'absolute',
            position: { left: `${percentage}%` },
            margin: { top: '-1%', left: '-2.5%' },
            height: '120%',
            width: '5%'
          }}
          uiBackground={{
            textureMode: 'stretch',
            texture: { src: 'assets/images/menu/slider.png' }
          }}
        />
      </UiEntity>
    </UiEntity>
  )
}

export type SliderProps = {
  value: number
  min: number
  max: number
  stepSize: number
  uiTransform?: UiTransformProps
  showStepButtons?: boolean
  onChange?: (value: number) => void
  onRelease?: (value: number) => void
  backgroundBar?: Color4
}

export function Slider({
  value,
  min,
  max,
  stepSize,
  uiTransform,
  showStepButtons = false,
  onChange,
  onRelease,
  backgroundBar = RED
}: SliderProps): ReactEcs.JSX.Element {
  const emit = (next: number, isRelease: boolean): void => {
    const clamped = Math.max(min, Math.min(max, next))
    const rounded = roundToStep(clamped, stepSize)
    onChange?.(rounded)
    if (isRelease) onRelease?.(rounded)
  }

  const slider = (
    <BasicSlider
      value={value}
      min={min}
      max={max}
      stepSize={stepSize || 1}
      onChange={(v) => emit(v, false)}
      onRelease={() => onRelease?.(value)}
      backgroundBar={backgroundBar}
      uiTransform={
        showStepButtons
          ? {
              width: '80%',
              height: '90%',
              margin: { left: '-5%' },
              flexShrink: 0,
              flexGrow: 0
            }
          : { width: '100%', height: '100%' }
      }
    />
  )

  if (!showStepButtons) {
    return (
      <UiEntity
        uiTransform={{ width: '100%', height: 28, ...uiTransform }}
      >
        {slider}
      </UiEntity>
    )
  }

  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: 28,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...uiTransform
      }}
    >
      <UiEntity
        uiTransform={{
          width: '6%',
          height: '80%',
          flexShrink: 0,
          justifyContent: 'center',
          alignItems: 'center'
        }}
        onMouseDown={() => emit(value - (stepSize || 1), true)}
      >
        <Icon
          icon={{ atlasName: 'icons', spriteName: 'LeftArrow' }}
          iconSize="100%"
          iconColor={Color4.White()}
        />
      </UiEntity>
      {slider}
      <UiEntity
        uiTransform={{
          width: '6%',
          height: '80%',
          flexShrink: 0,
          justifyContent: 'center',
          alignItems: 'center'
        }}
        onMouseDown={() => emit(value + (stepSize || 1), true)}
      >
        <Icon
          icon={{ atlasName: 'icons', spriteName: 'RightArrow' }}
          iconSize="100%"
          iconColor={Color4.White()}
        />
      </UiEntity>
    </UiEntity>
  )
}
