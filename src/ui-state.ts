const state = {
  chatOpen: false,
  settingsOpen: false
}

const subscribers = new Set<() => void>()

export function getChatOpen(): boolean {
  return state.chatOpen
}

export function getSettingsOpen(): boolean {
  return state.settingsOpen
}

export function setChatOpen(open: boolean): void {
  if (state.chatOpen === open) return
  state.chatOpen = open
  notify()
}

export function setSettingsOpen(open: boolean): void {
  if (state.settingsOpen === open) return
  state.settingsOpen = open
  notify()
}

export function toggleChat(): void {
  setChatOpen(!state.chatOpen)
}

export function toggleSettings(): void {
  setSettingsOpen(!state.settingsOpen)
}

export function subscribeUiState(fn: () => void): () => void {
  subscribers.add(fn)
  return () => {
    subscribers.delete(fn)
  }
}

function notify(): void {
  for (const fn of subscribers) fn()
}
