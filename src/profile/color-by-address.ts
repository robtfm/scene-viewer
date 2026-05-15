import nameColors from './name-colors.json'
import { ZERO_ADDRESS } from '../constants'
import { getHashNumber } from './hash'

export type RGBA = { r: number; g: number; b: number; a: number }

const FALLBACK: RGBA = { r: 0.6, g: 0.6, b: 0.6, a: 1 }
const UNCLAIMED: RGBA = {
  r: 0xc6 / 255,
  g: 0xc6 / 255,
  b: 0xc6 / 255,
  a: 1
}

const cache = new Map<string, RGBA>()

export function getAddressColor(address: string): RGBA {
  if (address === ZERO_ADDRESS) return FALLBACK
  const hit = cache.get(address)
  if (hit) return hit
  const colors = nameColors as RGBA[]
  const color = colors[getHashNumber(address, 0, colors.length - 1)]
  cache.set(address, color)
  return color
}

export const UNCLAIMED_NAME_COLOR = UNCLAIMED
