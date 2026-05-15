import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { UiEntity, type UiTransformProps } from '@dcl/sdk/react-ecs'
import { getBackgroundFromAtlas } from '../atlas'
import {
  ALMOST_BLACK,
  ALMOST_WHITE,
  DROPDOWN_ITEM_HOVER,
  ORANGE
} from '../constants'

export type DropdownOption = { label: string; value: string }

export type DropdownProps = {
  options: DropdownOption[]
  value: string
  fontSize?: number
  uiTransform?: UiTransformProps
  onChange: (value: string) => void
  listMaxHeight?: number
}

export function Dropdown({
  options,
  value,
  fontSize = 14,
  uiTransform,
  onChange,
  listMaxHeight
}: DropdownProps): ReactEcs.JSX.Element {
  const [open, setOpen] = ReactEcs.useState(false)
  const [hovered, setHovered] = ReactEcs.useState<number | null>(null)
  const selectedIndex = options.findIndex((o) => o.value === value)
  const rowHeight = fontSize * 2.1

  return (
    <UiEntity
      uiTransform={{
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        ...uiTransform
      }}
    >
      <UiEntity
        uiTransform={{
          width: '100%',
          height: '100%',
          flexGrow: 1,
          flexShrink: 0,
          padding: { left: fontSize * 0.5, right: fontSize * 0.3 },
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: fontSize / 2
        }}
        uiBackground={{ color: Color4.White() }}
        onMouseDown={() => {
          setOpen(!open)
        }}
      >
        <UiEntity
          uiTransform={{ width: '100%', height: fontSize * 2.2 }}
          uiText={{
            value: options[selectedIndex]?.label ?? value,
            fontSize,
            color: ALMOST_BLACK,
            textAlign: 'middle-left'
          }}
        />
        <UiEntity
          uiTransform={{ width: fontSize, height: fontSize }}
          uiBackground={{
            ...getBackgroundFromAtlas({
              atlasName: 'icons',
              spriteName: 'DownArrow'
            }),
            color: Color4.Black()
          }}
        />

        <UiEntity
          uiTransform={{
            display: open ? 'flex' : 'none',
            width: '100%',
            height:
              listMaxHeight ??
              Math.min(options.length, 4) * rowHeight + fontSize * 0.2,
            maxHeight: listMaxHeight,
            positionType: 'absolute',
            position: { left: 0, top: 2.5 * fontSize },
            zIndex: 2,
            borderRadius: 6
          }}
          uiBackground={{ color: ALMOST_WHITE }}
          onMouseLeave={() => {
            setHovered(null)
          }}
        >
          <UiEntity
            uiTransform={{
              width: '100%',
              height: '100%',
              flexDirection: 'column',
              overflow: 'scroll'
            }}
          >
            <UiEntity
              uiTransform={{
                width: '95%',
                height: 'auto',
                flexDirection: 'column',
                margin: '2.5%'
              }}
            >
              {options.map((option, index) => (
                <UiEntity
                  key={option.value}
                  uiTransform={{
                    width: '100%',
                    height: rowHeight,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: { left: fontSize * 0.4, right: fontSize * 0.3 },
                    borderRadius: 4
                  }}
                  uiBackground={{
                    color:
                      hovered === index ? DROPDOWN_ITEM_HOVER : ALMOST_WHITE
                  }}
                  onMouseDown={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                  onMouseEnter={() => {
                    setHovered(index)
                  }}
                >
                  <UiEntity
                    uiTransform={{ width: 'auto', height: '100%' }}
                    uiText={{
                      value: option.label,
                      fontSize,
                      color: ALMOST_BLACK,
                      textAlign: 'middle-left'
                    }}
                  />
                  <UiEntity
                    uiTransform={{
                      display: selectedIndex === index ? 'flex' : 'none',
                      width: fontSize,
                      height: fontSize
                    }}
                    uiBackground={{
                      ...getBackgroundFromAtlas({
                        atlasName: 'icons',
                        spriteName: 'Check'
                      }),
                      color: ORANGE
                    }}
                  />
                </UiEntity>
              ))}
            </UiEntity>
          </UiEntity>
        </UiEntity>
      </UiEntity>
    </UiEntity>
  )
}
