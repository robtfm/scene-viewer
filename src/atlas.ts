import { type UiBackgroundProps } from '@dcl/react-ecs'
import iconsJson from '../assets/images/atlas/icons.json'

type Frame = { x: number; y: number; w: number; h: number }
type Sprite = { frame: Frame }
type AtlasData = {
  frames: Record<string, Sprite>
  meta: { size: { w: number; h: number } }
}

export type AtlasName = 'icons'

export type AtlasIcon = { atlasName: AtlasName; spriteName: string }

const atlases: Record<AtlasName, AtlasData> = {
  icons: iconsJson as AtlasData
}

function getUvs(icon: AtlasIcon): number[] {
  const data = atlases[icon.atlasName]
  if (!data) return []
  const key = `${icon.spriteName}.png`
  const sprite = data.frames[key]
  if (!sprite) return []
  const W = data.meta.size.w
  const H = data.meta.size.h
  const x0 = sprite.frame.x / W
  const x1 = (sprite.frame.x + sprite.frame.w) / W
  const y0 = 1 - (sprite.frame.y + sprite.frame.h) / H
  const y1 = 1 - sprite.frame.y / H
  return [x0, y0, x0, y1, x1, y1, x1, y0]
}

export function getBackgroundFromAtlas(icon: AtlasIcon): UiBackgroundProps {
  return {
    textureMode: 'stretch',
    uvs: getUvs(icon),
    texture: { src: `assets/images/atlas/${icon.atlasName}.png` }
  }
}
