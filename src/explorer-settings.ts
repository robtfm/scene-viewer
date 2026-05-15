import { BevyApi } from './bevy-api'

const PRESET: Record<string, number> = {
  'Distant Scene Rendering': 0,
  'Scene Load Distance': 1,
  'Scene Unload Distance': 0,
  Fog: 0
}

export const FORCED_SETTING_NAMES: ReadonlySet<string> = new Set(
  Object.keys(PRESET)
)

export async function applyExplorerSettings(): Promise<void> {
  const settings = await BevyApi.getSettings()
  const byName = new Map(settings.map((s) => [s.name, s]))
  for (const [name, target] of Object.entries(PRESET)) {
    const setting = byName.get(name)
    if (!setting) {
      console.log(`setting "${name}" not present — skipping`)
      continue
    }
    if (setting.value === target) {
      console.log(`setting "${name}" already ${target}`)
      continue
    }
    console.log(`setting "${name}" ${setting.value} → ${target}`)
    await BevyApi.setSetting(name, target)
  }
}
