import type { MeshData } from 'vox-to-mesh'

export type Config = {
  duration: number
  fps: number
  width: number
  height: number
  outDir: string
  outputName: string
  quality: number
}

export const renderToGif: (mesh: MeshData, config?: Partial<Config>, onFinish: () => void) => void
export const renderToGifPromise: (mesh: MeshData, config?: Partial<Config>) => Promise<void>
