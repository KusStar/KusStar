import fit from 'canvas-fit'
import * as kuss from 'kusstar'
import { animate } from 'popmotion'
import createRegl from 'regl'

import createCamera from './camera'
import { createPlayer } from './player'
import { animateChain } from './utils'

const canvas = document.body.appendChild(document.createElement('canvas'))
const regl = createRegl(canvas)

const { camera, cameraState } = createCamera(regl, {
  distance: 4,
  minDistance: 1,
  maxDistance: 50,
  phi: Math.PI / 8
})

const loading = animate({
  from: 0,
  to: Math.PI * 2,
  onUpdate: (val) => (cameraState.theta = val),
  repeat: Infinity,
  duration: 1000
})

const start = () => {
  loading.stop()
  cameraState.theta = 0
  // 豪哟根 SHORYUKEN
  animateChain({
    from: cameraState.distance,
    to: 7,
    duration: 1000,
    onUpdate: (val) => (cameraState.distance = val)
  })
    .then(() =>
      animateChain({
        from: 8,
        to: 1,
        duration: 43000,
        onUpdate: (val) => (cameraState.distance = val)
      })
    )
    .then(() => {
      const loop = animate({
        from: 0,
        to: Math.PI * 2,
        onUpdate: (val) => (cameraState.theta = val),
        repeat: Infinity,
        repeatDelay: 0,
        duration: 3000,
        mass: 0,
        damping: 0,
        stiffness: 0
      })
      player.on('ended', () => {
        loop.stop()
        animate({
          from: cameraState.theta,
          to: Math.PI,
          onUpdate: (val) => (cameraState.theta = val)
        })
      })
    })
}

const player = createPlayer()
player.on('playing', start)

window.addEventListener('resize', fit(canvas), false)

const drawMesh = regl({
  frag: `
    precision lowp float;
    varying vec3 vcolor;
    void main () {
      gl_FragColor = vec4(vcolor, 1.0);
    }`,
  vert: `
    precision lowp float;
    uniform mat4 projection, view;
    attribute vec3 position, color;
    varying vec3 vcolor;
    void main () {
      vcolor = color;
      gl_Position = projection * view * vec4(position, 1.0);
    }`,
  attributes: {
    position: kuss.positions,
    color: kuss.colors
  },
  elements: kuss.cells
})

regl.frame(() => {
  regl.clear({
    color: [0, 0, 0, 1]
  })
  camera(() => {
    drawMesh()
  })
})
