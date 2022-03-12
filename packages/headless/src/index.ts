/**
 * Thanks to
 * @reference https://github.com/akira-cn/node-canvas-webgl#with-threejs
 * @reference https://stackoverflow.com/questions/41670308/three-buffergeometry-how-do-i-manually-set-face-colors
 */
import { MeshData } from '@kuss/vox-to-mesh'
import * as THREE from 'three'

import { BasicRenderer, Config } from './basic_renderer'

export { BasicRenderer, Config }

class VoxRenderer extends BasicRenderer {
  mesh: THREE.Mesh

  constructor(meshData: MeshData, config: Partial<Config>, onFinish?: () => void) {
    super(config, onFinish)

    this.camera.position.z = 3

    this.mesh = this.getMeshFromVox(meshData)
    this.scene.add(this.mesh)
  }

  raf() {
    super.raf()
    this.mesh.rotation.y += Math.PI / this.totalFrame * 2
  }
}

export const renderToGif = (
  meshData: MeshData,
  config: Partial<Config>,
  onFinish?: (...args: any[]) => void
) => {
  const voxRenderer = new VoxRenderer(meshData, config, onFinish)
  voxRenderer.start()
}

export const renderToGifPromise = (meshData, config) => {
  return new Promise<any>((resolve) => {
    renderToGif(meshData, config, resolve)
  })
}
