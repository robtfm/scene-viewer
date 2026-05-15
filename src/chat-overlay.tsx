import { engine, executeTask, UiCanvasInformation } from '@dcl/sdk/ecs'
import { Vector2 } from '@dcl/sdk/math'
import { getPlayer } from '@dcl/sdk/players'
import ReactEcs, { type Key, Label, UiEntity } from '@dcl/sdk/react-ecs'
import { BevyApi, type ChatMessageDefinition } from './bevy-api'
import { AvatarCircle } from './components/avatar-circle'
import { Icon } from './components/icon'
import { ALMOST_WHITE, ONE_ADDRESS, ZERO_ADDRESS } from './constants'
import {
  getAddressColor,
  UNCLAIMED_NAME_COLOR
} from './profile/color-by-address'
import {
  ensureProfileLoaded,
  getDisplayName,
  hasClaimedName,
  onProfileUpdate
} from './profile/profile-service'

const MAX_MESSAGES = 12
const CONTROL_MARKER = '␑'

const FONT_SIZE = 14
const TS_FONT_SIZE = 12
const AVATAR_SIZE = 36
const BUBBLE_PAD = 6

type Entry = ChatMessageDefinition & { id: number; ts: number }

let nextId = 1
const messages: Entry[] = []
const subscribers = new Set<() => void>()
let autoScrollSwitch = 0

function notify(): void {
  for (const fn of subscribers) fn()
}

function pushMessage(message: ChatMessageDefinition): void {
  messages.push({ ...message, id: nextId++, ts: Date.now() })
  if (messages.length > MAX_MESSAGES) messages.shift()
  if (!isSystem(message.sender_address)) {
    ensureProfileLoaded(message.sender_address)
  }
  autoScrollSwitch = autoScrollSwitch === 0 ? 1 : 0
  notify()
}

function isSystem(address: string): boolean {
  return address === ZERO_ADDRESS || address === ONE_ADDRESS
}

let streamStarted = false
export function startChatStream(): void {
  if (streamStarted) return
  streamStarted = true
  onProfileUpdate(() => {
    notify()
  })
  executeTask(async () => {
    try {
      const stream = await BevyApi.getChatStream()
      for await (const message of stream) {
        if (message.channel !== 'Nearby') continue
        if (message.message.indexOf(CONTROL_MARKER) === 0) continue
        pushMessage(message)
      }
    } catch (e) {
      console.error('chat stream ended', e)
    }
  })
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number): string => n.toString().padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function MessageBubble({
  m
}: {
  m: Entry
  key?: Key
}): ReactEcs.JSX.Element {
  const system = isSystem(m.sender_address)
  const player = system ? null : getPlayer({ userId: m.sender_address })
  const claimed = !system && hasClaimedName(m.sender_address)
  const nameColor = claimed
    ? getAddressColor(m.sender_address)
    : UNCLAIMED_NAME_COLOR
  const bubbleBg = system
    ? { r: 0, g: 0, b: 0, a: 0.4 }
    : { r: 0, g: 0, b: 0, a: 0.8 }

  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        flexDirection: 'row',
        alignItems: 'flex-end',
        margin: { bottom: 4 }
      }}
    >
      <AvatarCircle
        userId={m.sender_address}
        color={nameColor}
        size={AVATAR_SIZE}
        isGuest={player?.isGuest ?? false}
        uiTransform={{ margin: { right: 8, bottom: 2 } }}
      />
      <UiEntity
        uiTransform={{
          maxWidth: '85%',
          flexDirection: 'column',
          padding: BUBBLE_PAD,
          borderRadius: 10
        }}
        uiBackground={{ color: bubbleBg }}
      >
        {!system && (
          <UiEntity
            uiTransform={{
              flexDirection: 'row',
              alignItems: 'center',
              width: 'auto',
              height: FONT_SIZE + 4,
              margin: { bottom: 2 }
            }}
          >
            <Label
              value={`<b>${getDisplayName(m.sender_address)}</b>`}
              fontSize={FONT_SIZE}
              color={nameColor}
              textAlign="middle-left"
              uiTransform={{ width: 'auto' }}
            />
            {claimed && (
              <Icon
                icon={{ atlasName: 'icons', spriteName: 'Verified' }}
                iconSize={FONT_SIZE}
                uiTransform={{ margin: { left: 4 } }}
              />
            )}
          </UiEntity>
        )}
        <Label
          value={system ? `<i>${m.message}</i>` : m.message}
          fontSize={FONT_SIZE}
          color={ALMOST_WHITE}
          textAlign="middle-left"
          textWrap="wrap"
          uiTransform={{ width: '100%' }}
        />
        <Label
          value={formatTime(m.ts)}
          fontSize={TS_FONT_SIZE}
          color={{ r: 0.7, g: 0.7, b: 0.7, a: 1 }}
          textAlign="middle-left"
          uiTransform={{ width: 'auto', margin: { top: 2 } }}
        />
      </UiEntity>
    </UiEntity>
  )
}

export function ChatOverlay(): ReactEcs.JSX.Element {
  const [, setTick] = ReactEcs.useState(0)
  ReactEcs.useEffect(() => {
    const sub = (): void => {
      setTick((t) => t + 1)
    }
    subscribers.add(sub)
    return () => {
      subscribers.delete(sub)
    }
  }, [])

  const canvas = UiCanvasInformation.getOrNull(engine.RootEntity)
  const canvasHeight = canvas?.height ?? 720
  const chatWidth = canvasHeight * 0.4
  const hudBarWidth = canvasHeight * 0.05
  const maxHeight = canvasHeight * 0.7
  const scrollPosition = Vector2.create(0, canvasHeight * 10 - autoScrollSwitch)

  return (
    <UiEntity
      uiTransform={{
        positionType: 'absolute',
        position: { bottom: 20, left: hudBarWidth },
        width: chatWidth,
        maxHeight,
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: 8,
        overflow: 'scroll',
        scrollVisible: 'hidden',
        scrollPosition
      }}
      uiBackground={{ color: { r: 0, g: 0, b: 0, a: 0.2 } }}
    >
      {messages.map((m) => (
        <MessageBubble key={m.id} m={m} />
      ))}
    </UiEntity>
  )
}
