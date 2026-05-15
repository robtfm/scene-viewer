export type ExplorerSetting = {
  name: string
  category: string
  description: string
  minValue: number
  maxValue: number
  namedVariants: Array<{ name: string; description: string }>
  value: number
  default: number
  stepSize: number
}

export type ChatMessageDefinition = {
  sender_address: string
  message: string
  channel: string
  timestamp: number
}

export type BevyApiInterface = {
  loginGuest: () => void
  logout: () => void
  getSettings: () => Promise<ExplorerSetting[]>
  setSetting: (name: string, value: number) => Promise<void>
  getChatStream: () => Promise<ChatMessageDefinition[]>
  sendChat: (message: string, channel?: string) => void
  getParams: () => Promise<Record<string, string>>
}

let bevyApiFound = false
let bevyApiInner: BevyApiInterface | Record<string, never> = {}
try {
  bevyApiInner = (globalThis as any).require('~system/BevyExplorerApi')
  bevyApiFound = true
} catch (e) {
  bevyApiInner = {}
  console.error('BevyExplorerApi not found')
}

export const BevyApi = new Proxy(bevyApiInner, {
  get(target, prop) {
    if (bevyApiFound) {
      if (prop in target) {
        return (target as any)[prop]
      }
      return (...args: any[]) => {
        console.log('BevyApi method not found', prop, args)
      }
    }
    return (...args: any[]) => {
      console.log('BevyApi not found', prop, args)
    }
  }
}) as BevyApiInterface
