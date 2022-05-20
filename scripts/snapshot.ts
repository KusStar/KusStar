import { BasicRenderer, Config } from '@kuss/headless'
import kusstar from 'kusstar'
import path from 'path'
import * as THREE from 'three'

class KussRenderer extends BasicRenderer {
  kussMesh: THREE.Mesh
  km2: THREE.Mesh
  km22: THREE.Mesh
  km3: THREE.Mesh
  km33: THREE.Mesh

  constructor(config: Partial<Config>) {
    super(config)

    this.camera.position.z = 3
    this.#addMeshes()
  }

  #addMeshes() {
    this.kussMesh = this.getMeshFromVox(kusstar)

    this.km2 = this.kussMesh.clone()
    this.km2.scale.multiplyScalar(0.3)

    this.km22 = this.km2.clone()
    this.km3 = this.km2.clone()
    this.km33 = this.km2.clone()

    this.scene.add(this.kussMesh, this.km2, this.km22, this.km3, this.km33)
  }

  raf() {
    super.raf()

    const angle = Math.PI / this.totalFrame * 2
    const factor = 2

    this.kussMesh.rotation.y += angle

    this.km2.rotation.y += angle
    this.km22.rotation.y += angle

    this.km3.rotation.y += angle
    this.km33.rotation.y += angle

    this.km2.position.x = Math.sin(this.kussMesh.rotation.y * factor)
    this.km2.position.z = Math.cos(this.kussMesh.rotation.y * factor)

    this.km22.position.x = Math.sin(this.kussMesh.rotation.y * factor + Math.PI / 3) * 1.3
    this.km22.position.z = Math.cos(this.kussMesh.rotation.y * factor + Math.PI / 3) * 1.3

    this.km3.position.x = Math.sin(this.kussMesh.rotation.y * factor + Math.PI / 2)
    this.km3.position.y = Math.cos(this.kussMesh.rotation.y * factor + Math.PI / 2)

    this.km33.position.x = Math.sin(this.kussMesh.rotation.y * factor) * 1.3
    this.km33.position.y = Math.cos(this.kussMesh.rotation.y * factor) * 1.3
  }
}

const kussRenderer = new KussRenderer({
  quality: 10,
  fps: 36,
  outDir: path.join(__dirname, '../snapshot')
})

kussRenderer.start()
