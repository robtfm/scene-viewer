// FNV-1a-style 64-bit hash, matches the Rust 64-bit implementation
// used elsewhere in the explorer. Ported from bevy-ui-scene.

function utf8Encode(str: string): number[] {
  const bytes: number[] = []
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i)
    if (code < 0x80) {
      bytes.push(code)
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6))
      bytes.push(0x80 | (code & 0x3f))
    } else if (code < 0x10000) {
      bytes.push(0xe0 | (code >> 12))
      bytes.push(0x80 | ((code >> 6) & 0x3f))
      bytes.push(0x80 | (code & 0x3f))
    } else {
      bytes.push(0xf0 | (code >> 18))
      bytes.push(0x80 | ((code >> 12) & 0x3f))
      bytes.push(0x80 | ((code >> 6) & 0x3f))
      bytes.push(0x80 | (code & 0x3f))
    }
  }
  return bytes
}

function simpleHash(str: string): bigint {
  const bytes = utf8Encode(str)
  let hash = 2166136261n
  for (const byte of bytes) {
    hash ^= BigInt(byte)
    hash *= 16777619n
    hash = hash & 0xffffffffffffffffn
  }
  return hash
}

export function getHashNumber(name: string, min: number, max: number): number {
  if (min > max) throw new Error('min cannot be greater than max')
  if (min === max) return min
  const hash = simpleHash(name)
  const range = BigInt(max - min + 1)
  return min + Number(hash % range)
}
