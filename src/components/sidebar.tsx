import { engine, UiCanvasInformation } from '@dcl/sdk/ecs'
import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'
import { ALPHA_BLACK_PANEL } from '../constants'
import {
  getChatOpen,
  getSettingsOpen,
  toggleChat,
  toggleSettings
} from '../ui-state'
import { ButtonIcon } from './button-icon'

const MIN_BUTTON_SIZE = 38

type HoverTarget = 'chat' | 'settings' | null

const hover: { current: HoverTarget } = { current: null }

export function getSidebarWidth(canvasHeight: number): number {
  return canvasHeight * 0.05
}

export function Sidebar(): ReactEcs.JSX.Element | null {
  const canvas = UiCanvasInformation.getOrNull(engine.RootEntity)
  if (canvas === null) return null
  const canvasHeight = canvas.height
  const buttonSize = Math.max(MIN_BUTTON_SIZE, canvasHeight * 0.05)
  const sidebarWidth = getSidebarWidth(canvasHeight)
  const chatOpen = getChatOpen()
  const settingsOpen = getSettingsOpen()

  return (
    <UiEntity
      uiTransform={{
        positionType: 'absolute',
        position: { top: 0, left: 0 },
        width: sidebarWidth,
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: { top: 8, bottom: 8 }
      }}
      uiBackground={{ color: ALPHA_BLACK_PANEL }}
    >
      <ButtonIcon
        size={buttonSize}
        icon={{
          atlasName: 'navbar',
          spriteName: settingsOpen ? 'Settings on' : 'Settings off'
        }}
        highlighted={hover.current === 'settings' || settingsOpen}
        onMouseEnter={() => {
          hover.current = 'settings'
        }}
        onMouseLeave={() => {
          if (hover.current === 'settings') hover.current = null
        }}
        onMouseDown={() => {
          toggleSettings()
        }}
      />

      <ButtonIcon
        size={buttonSize}
        icon={{
          atlasName: 'navbar',
          spriteName: chatOpen ? 'Chat on' : 'Chat off'
        }}
        highlighted={hover.current === 'chat' || chatOpen}
        onMouseEnter={() => {
          hover.current = 'chat'
        }}
        onMouseLeave={() => {
          if (hover.current === 'chat') hover.current = null
        }}
        onMouseDown={() => {
          toggleChat()
        }}
      />
    </UiEntity>
  )
}
