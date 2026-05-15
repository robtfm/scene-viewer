import { engine, executeTask, UiCanvasInformation } from '@dcl/sdk/ecs'
import ReactEcs, { type Key, Label, UiEntity } from '@dcl/sdk/react-ecs'
import { BevyApi, type ExplorerSetting } from '../bevy-api'
import { ALMOST_WHITE, ALPHA_BLACK_PANEL } from '../constants'
import { FORCED_SETTING_NAMES } from '../explorer-settings'
import { toggleSettings } from '../ui-state'
import { Dropdown } from './dropdown'
import { Slider } from './slider'

type Tab = 'Audio' | 'Graphics'
const TABS: Tab[] = ['Audio', 'Graphics']

const state = {
  loaded: false,
  loading: false,
  settings: [] as ExplorerSetting[],
  tab: 'Graphics' as Tab
}
const subscribers = new Set<() => void>()
function notify(): void {
  for (const fn of subscribers) fn()
}

export function ensureSettingsLoaded(): void {
  if (state.loaded || state.loading) return
  state.loading = true
  executeTask(async () => {
    try {
      state.settings = await BevyApi.getSettings()
      state.loaded = true
    } catch (e) {
      console.error('getSettings failed', e)
    } finally {
      state.loading = false
      notify()
    }
  })
}

function applyChange(name: string, value: number): void {
  state.settings = state.settings.map((s) =>
    s.name === name ? { ...s, value } : s
  )
  notify()
  BevyApi.setSetting(name, value).catch((e) => {
    console.error('setSetting failed', name, value, e)
  })
}

function intValueLabel(setting: ExplorerSetting): string {
  if (setting.stepSize && setting.stepSize < 1) {
    const decimals = setting.stepSize.toString().split('.')[1]?.length ?? 0
    return setting.value.toFixed(decimals)
  }
  return String(Math.round(setting.value))
}

function SettingRow({
  setting
}: {
  setting: ExplorerSetting
  key?: Key
}): ReactEcs.JSX.Element {
  const isEnum = setting.namedVariants && setting.namedVariants.length > 0
  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        height: 36,
        margin: { bottom: 8 }
      }}
    >
      <Label
        value={setting.name}
        fontSize={14}
        color={ALMOST_WHITE}
        textAlign="middle-left"
        uiTransform={{ width: '40%', height: '100%' }}
      />

      {isEnum ? (
        <UiEntity uiTransform={{ width: '55%', height: '100%' }}>
          <Dropdown
            options={setting.namedVariants.map((v) => ({
              label: v.name,
              value: v.name
            }))}
            value={
              setting.namedVariants[Math.round(setting.value)]?.name ??
              setting.namedVariants[0].name
            }
            fontSize={13}
            uiTransform={{ width: '100%', height: '100%' }}
            onChange={(name) => {
              const idx = setting.namedVariants.findIndex(
                (v) => v.name === name
              )
              if (idx >= 0) applyChange(setting.name, idx)
            }}
          />
        </UiEntity>
      ) : (
        <UiEntity
          uiTransform={{
            width: '55%',
            height: '100%',
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          <Label
            value={intValueLabel(setting)}
            fontSize={13}
            color={ALMOST_WHITE}
            textAlign="middle-right"
            uiTransform={{
              width: 60,
              height: '100%',
              margin: { right: 8 }
            }}
          />
          <UiEntity uiTransform={{ flexGrow: 1, height: '100%' }}>
            <Slider
              value={setting.value}
              min={setting.minValue}
              max={setting.maxValue}
              stepSize={setting.stepSize || 1}
              showStepButtons
              onChange={(v) => {
                state.settings = state.settings.map((s) =>
                  s.name === setting.name ? { ...s, value: v } : s
                )
                notify()
              }}
              onRelease={(v) => {
                applyChange(setting.name, v)
              }}
            />
          </UiEntity>
        </UiEntity>
      )}
    </UiEntity>
  )
}

export function SettingsPanel(): ReactEcs.JSX.Element | null {
  const [, setTick] = ReactEcs.useState(0)
  ReactEcs.useEffect(() => {
    const sub = (): void => {
      setTick((t) => t + 1)
    }
    subscribers.add(sub)
    ensureSettingsLoaded()
    return () => {
      subscribers.delete(sub)
    }
  }, [])

  const canvas = UiCanvasInformation.getOrNull(engine.RootEntity)
  if (canvas === null) return null
  const w = Math.min(canvas.width * 0.6, 800)
  const h = Math.min(canvas.height * 0.7, 600)

  const filtered = state.settings.filter(
    (s) => s.category === state.tab && !FORCED_SETTING_NAMES.has(s.name)
  )

  return (
    <UiEntity
      uiTransform={{
        positionType: 'absolute',
        position: { top: 0, left: 0 },
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <UiEntity
        uiTransform={{
          width: w,
          height: h,
          flexDirection: 'column',
          padding: 16,
          borderRadius: 8,
          pointerFilter: 'block'
        }}
        uiBackground={{ color: ALPHA_BLACK_PANEL }}
      >
        <UiEntity
          uiTransform={{
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            height: 32,
            margin: { bottom: 12 }
          }}
        >
          <Label
            value="<b>Settings</b>"
            fontSize={18}
            color={ALMOST_WHITE}
            uiTransform={{ width: 100, height: '100%' }}
            textAlign="middle-left"
          />
          {TABS.map((t) => (
            <UiEntity
              key={t}
              uiTransform={{
                height: 28,
                padding: { left: 12, right: 12 },
                margin: { left: 6 },
                borderRadius: 4,
                justifyContent: 'center',
                alignItems: 'center'
              }}
              uiBackground={{
                color:
                  state.tab === t
                    ? { r: 1, g: 1, b: 1, a: 0.2 }
                    : { r: 1, g: 1, b: 1, a: 0.05 }
              }}
              onMouseDown={() => {
                state.tab = t
                notify()
              }}
            >
              <Label value={t} fontSize={14} color={ALMOST_WHITE} />
            </UiEntity>
          ))}
          <UiEntity uiTransform={{ width: 'auto', flexGrow: 1, height: 1 }} />
          <UiEntity
            uiTransform={{
              width: 28,
              height: 28,
              borderRadius: 4,
              justifyContent: 'center',
              alignItems: 'center'
            }}
            uiBackground={{ color: { r: 1, g: 1, b: 1, a: 0.1 } }}
            onMouseDown={() => {
              toggleSettings()
            }}
          >
            <Label value="×" fontSize={18} color={ALMOST_WHITE} />
          </UiEntity>
        </UiEntity>

        <UiEntity
          uiTransform={{
            width: '100%',
            flexGrow: 1,
            flexDirection: 'column',
            overflow: 'scroll',
            scrollVisible: 'vertical'
          }}
        >
          {!state.loaded && (
            <Label
              value={state.loading ? 'Loading…' : 'No settings'}
              fontSize={14}
              color={ALMOST_WHITE}
            />
          )}
          {state.loaded &&
            filtered.map((s) => <SettingRow key={s.name} setting={s} />)}
        </UiEntity>
      </UiEntity>
    </UiEntity>
  )
}
