import ReactEcs, { ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'
import { ChatOverlay, startChatStream } from './chat-overlay'
import { SettingsPanel } from './components/settings-panel'
import { Sidebar } from './components/sidebar'
import { getChatOpen, getSettingsOpen, subscribeUiState } from './ui-state'

function Root(): ReactEcs.JSX.Element {
  const [, setTick] = ReactEcs.useState(0)
  ReactEcs.useEffect(() => {
    const unsub = subscribeUiState(() => {
      setTick((t) => t + 1)
    })
    return unsub
  }, [])

  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        positionType: 'absolute'
      }}
    >
      <Sidebar />
      {getChatOpen() && <ChatOverlay />}
      {getSettingsOpen() && <SettingsPanel />}
    </UiEntity>
  )
}

export function installUi(): void {
  startChatStream()
  ReactEcsRenderer.setUiRenderer(Root)
}
