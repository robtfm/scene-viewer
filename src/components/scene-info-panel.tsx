import { engine, UiCanvasInformation } from '@dcl/sdk/ecs'
import ReactEcs, { Label, UiEntity } from '@dcl/sdk/react-ecs'
import { ALMOST_WHITE, ALPHA_BLACK_PANEL } from '../constants'
import {
  getCurrentParcel,
  getCurrentSceneTitle,
  subscribeCurrentScene
} from '../current-scene'

export function SceneInfoPanel(): ReactEcs.JSX.Element | null {
  const [, setTick] = ReactEcs.useState(0)
  ReactEcs.useEffect(() => {
    const unsub = subscribeCurrentScene(() => {
      setTick((t) => t + 1)
    })
    return unsub
  }, [])

  const canvas = UiCanvasInformation.getOrNull(engine.RootEntity)
  if (canvas === null) return null
  const sidebarWidth = canvas.height * 0.05

  const title = getCurrentSceneTitle()
  const parcel = getCurrentParcel()

  return (
    <UiEntity
      uiTransform={{
        positionType: 'absolute',
        position: { top: 12, left: sidebarWidth + 12 },
        flexDirection: 'row',
        alignItems: 'center',
        padding: { top: 6, bottom: 6, left: 12, right: 12 },
        borderRadius: 8
      }}
      uiBackground={{ color: ALPHA_BLACK_PANEL }}
    >
      <Label
        value={`<b>${title ?? 'empty parcel'}</b>`}
        fontSize={14}
        color={ALMOST_WHITE}
        textAlign="middle-left"
        uiTransform={{ width: 'auto', height: 18 }}
      />
      {parcel && (
        <Label
          value={`  ${parcel.x},${parcel.y}`}
          fontSize={12}
          color={{ r: 0.7, g: 0.7, b: 0.7, a: 1 }}
          textAlign="middle-left"
          uiTransform={{ width: 'auto', height: 18, margin: { left: 6 } }}
        />
      )}
    </UiEntity>
  )
}
