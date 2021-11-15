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
const kusstar = require('kusstar')
const ora = require('ora')
const path = require('path')
const config = require('./config.json')

const TOTAL_FRAME = config.totalFrame || 120
const WIDTH = config.width || 512
const HEIGHT = config.height || 256
const FRAME_TIME = config.frameTime || (1000 / 60)

const OUT_DIR = path.join(__dirname, '../../snapshot')
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true })
}
const OUT_FILE = path.join(__dirname, '../../snapshot', config.outputName)
const outStream = fs.createWriteStream(OUT_FILE)

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(50, WIDTH / HEIGHT, 1, 1000)

const canvas = createCanvas(WIDTH, HEIGHT)

const renderer = new THREE.WebGLRenderer({
  canvas
})

const light = new THREE.AmbientLight(0xffffff, 1)

scene.add(light)

// kusstar model
const geometry = new THREE.BufferGeometry()

geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(kusstar.positions), 3))
geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(kusstar.normals), 3))
geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(kusstar.colors), 3))
geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(kusstar.cells), 1))

const material = new THREE.MeshStandardMaterial({
  roughness: 1.0, vertexColors: true
})

const mesh = new THREE.Mesh(geometry, material)

scene.add(mesh)

const encoder = new GIFEncoder(WIDTH, HEIGHT)
encoder.createReadStream().pipe(outStream)
encoder.setRepeat(0)
encoder.setDelay(FRAME_TIME)
encoder.setQuality(100)

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
  }
}

animate()
spinner.start()
encoder.start()
