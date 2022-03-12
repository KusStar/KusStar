import fs from 'fs'
import GIFEncoder from 'gifencoder'
import { createCanvas } from 'node-canvas-webgl'
import ora from 'ora'
import path from 'path'
import * as THREE from 'three'

import _config from '../config.json'

export type Config = {
  duration: number
  fps: number
  width: number
  height: number
  outDir: string
  outName: string
  quality: number
}

export const DEFAULT_CONFIG: Config = _config

export class BasicRenderer {
  outStream: fs.WriteStream
  totalFrame: number
  width: number
  height: number
  frameTime: number
  outFile: string

  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  canvas: any
  renderer: THREE.WebGLRenderer

  encoder: any
  spinner: ora.Ora

  config: Partial<Config>

  onFinish: () => void

  idx = 0

  constructor(config: Partial<Config>, onFinish?: () => void) {
    this.onFinish = onFinish

    this.initConfig(config)
    this.initRenderer()
    this.initGifEncoder()

    this.addSceneEnv()
  }

  initConfig(config: Partial<Config>) {
    config.duration = config.duration || DEFAULT_CONFIG.duration
    config.fps = config.fps || DEFAULT_CONFIG.fps
    config.width = config.width || DEFAULT_CONFIG.width
    config.height = config.height || DEFAULT_CONFIG.height
    config.outDir = config.outDir || DEFAULT_CONFIG.outDir
    config.outName = config.outName || DEFAULT_CONFIG.outName

    this.config = config

    const OUT_DIR = path.join(config.outDir)
    if (!fs.existsSync(OUT_DIR)) {
      fs.mkdirSync(OUT_DIR, { recursive: true })
    }
    this.outFile = path.join(OUT_DIR, config.outName)
    this.totalFrame = config.duration * config.fps
    this.width = config.width || DEFAULT_CONFIG.width
    this.height = config.height || DEFAULT_CONFIG.height
    this.frameTime = 1000 / config.fps
    this.outStream = fs.createWriteStream(this.outFile)
  }

  initRenderer() {
    this.scene = new THREE.Scene()

    this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 1, 1000)

    this.canvas = createCanvas(this.width, this.height)

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas
    })
  }

  initGifEncoder() {
    const encoder = new GIFEncoder(this.width, this.height)
    encoder.createReadStream().pipe(this.outStream)
    encoder.setRepeat(0)
    encoder.setDelay(this.frameTime)
    encoder.setQuality(this.config.quality || 10)

    this.encoder = encoder
    this.spinner = ora()
  }

  getMeshFromVox(voxMesh: any) {
    const geometry = new THREE.BufferGeometry()
    // @ts-ignore
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(voxMesh.positions), 3))
    geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(voxMesh.normals), 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(voxMesh.colors), 3))
    // @ts-ignore
    geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(voxMesh.cells), 1))
    const material = new THREE.MeshStandardMaterial({
      roughness: 1.0,
      vertexColors: true
    })

    return new THREE.Mesh(geometry, material)
  }

  addSceneEnv() {
    const light = new THREE.AmbientLight(0xffffff, 1)
    this.scene.add(light)
  }

  raf() {
    this.renderer.render(this.scene, this.camera)
    if (this.idx > 0) {
      this.encoder.addFrame(this.canvas.__ctx__)
    }
    this.idx++
    if (this.idx <= this.totalFrame) {
      setTimeout(() => this.raf(), this.frameTime)
      this.spinner.text = `${this.idx} / ${this.totalFrame}`
    } else {
      this.encoder.finish()
      this.spinner.succeed()
      console.log(`Saved ${this.outFile}`)
      this.onFinish?.()
    }
  }

  start() {
    this.raf()
    this.spinner.start()
    this.encoder.start()
  }
}
