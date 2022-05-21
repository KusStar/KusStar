import { BasicRenderer, Config } from '@kuss/headless'
import kusstar from 'kusstar'
import path from 'path'
import * as THREE from 'three'

const o = 16

class KussRenderer extends BasicRenderer {
  kussMesh: THREE.Mesh
  kms: THREE.Mesh[] = []

  constructor(config: Partial<Config>) {
    super(config)

    this.camera.position.z = 3
    this.#addMeshes()
  }

  #addMeshes() {
    this.kussMesh = this.getMeshFromVox(kusstar)

    const ycount = o
    const xcount = o

    for (let y = 0; y < ycount; y++) {
      for (let i = 0; i < xcount; i++) {
        const px = -o + i * (o / 8)
        const py = -o + y * (o / 8)

        const km = this.getMeshFromVox(kusstar)

        km.material.transparent = true
        km.material.opacity = 0.5

        km.position.x = px
        km.position.y = py

        km.position.z = -10

        km.rotation.x = Math.PI / 4

        this.kms.push(km)
        this.scene.add(km)
      }
    }

    this.scene.add(this.kussMesh)
  }

  raf() {
    super.raf()

    const angle = Math.PI / this.totalFrame * 2

    const kmo = angle * Math.PI

    for (const km of this.kms) {
      km.rotation.y += angle

      km.position.x += kmo
      km.position.y += kmo

      if (km.position.x >= o) {
        km.position.x = -o
      }
      if (km.position.y >= o) {
        km.position.y = -o
      }
    }

    this.kussMesh.rotation.y += angle
  }
}

const kussRenderer = new KussRenderer({
  quality: 10,
  outDir: path.join(__dirname, '../snapshot')
})

kussRenderer.start()
