/**
 * Thanks to
 * @reference https://github.com/akira-cn/node-canvas-webgl#with-threejs
 * @reference https://stackoverflow.com/questions/41670308/three-buffergeometry-how-do-i-manually-set-face-colors
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')
const THREE = require('three')
const GIFEncoder = require('gifencoder')
const { createCanvas } = require('node-canvas-webgl')
const ora = require('ora')
const path = require('path')

const _config = require('./config.json')

const renderToGif = (
  meshData,
  config = {},
  onFinish
) => {
  config.duration = config.duration || _config.duration
  config.fps = config.fps || _config.fps
  config.width = config.width || _config.width
  config.height = config.height || _config.height
  config.outDir = config.outDir || _config.outDir
  config.outName = config.outName || _config.outputName

  const OUT_DIR = path.join(config.outDir)
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true })
  }
  const OUT_FILE = path.join(OUT_DIR, config.outputName)
  const TOTAL_FRAME = config.duration * config.fps
  const WIDTH = config.width || 512
  const HEIGHT = config.height || 256
  const FRAME_TIME = 1000 / config.fps

  const outStream = fs.createWriteStream(OUT_FILE)

  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(50, WIDTH / HEIGHT, 1, 1000)

  const canvas = createCanvas(WIDTH, HEIGHT)

  const renderer = new THREE.WebGLRenderer({
    canvas
  })

  const light = new THREE.AmbientLight(0xffffff, 1)

  scene.add(light)

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(meshData.positions), 3))
  geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(meshData.normals), 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(meshData.colors), 3))
  geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(meshData.cells), 1))
  const material = new THREE.MeshStandardMaterial({
    roughness: 1.0,
    vertexColors: true
  })

  const mesh = new THREE.Mesh(geometry, material)

  scene.add(mesh)

  const encoder = new GIFEncoder(WIDTH, HEIGHT)
  encoder.createReadStream().pipe(outStream)
  encoder.setRepeat(0)
  encoder.setDelay(FRAME_TIME)
  encoder.setQuality(config.quality || 10)

  camera.position.z = 3

  let idx = 0

  const spinner = ora()

  function animate() {
    mesh.rotation.y += Math.PI / TOTAL_FRAME * 2
    renderer.render(scene, camera)
    if (idx > 0) {
      encoder.addFrame(canvas.__ctx__)
    }
    idx++
    if (idx <= TOTAL_FRAME) {
      setTimeout(animate, FRAME_TIME)
      spinner.text = `${idx} / ${TOTAL_FRAME}`
    } else {
      encoder.finish()
      spinner.succeed()
      console.log(`Saved ${OUT_FILE}`)
      onFinish && onFinish()
    }
  }

  animate()
  spinner.start()
  encoder.start()
}

exports.renderToGif = renderToGif
exports.renderToGifPromise = (meshData, config) => {
  return new Promise((resolve) => {
    renderToGif(meshData, config, resolve)
  })
}
