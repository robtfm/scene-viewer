import ReactEcs, { ReactEcsRenderer } from '@dcl/sdk/react-ecs'
import { ChatOverlay, startChatStream } from './chat-overlay'

function Root(): ReactEcs.JSX.Element {
  return <ChatOverlay />
}

export function installUi(): void {
  startChatStream()
  ReactEcsRenderer.setUiRenderer(Root)
}
