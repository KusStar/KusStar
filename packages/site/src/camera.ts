/**
 * Modified @from https://github.com/regl-project/regl (MIT) Mikola Lysenko
 * @reference https://github.com/regl-project/regl/blob/c2239ef5166721024705c74a97bc0cf2ca517d09/example/util/camera.js
 */

import identity from 'gl-mat4/identity'
import lookAt from 'gl-mat4/lookAt'
import perspective from 'gl-mat4/perspective'
import mouseChange from 'mouse-change'
import mouseWheel from 'mouse-wheel'

export type Props = {
  center?: number
  distance?: number
  minDistance?: number
  maxDistance?: number
  theta?: number
  phi?: number
  up?: number[]
}

function createCamera(regl, props: Props = {}) {
  const cameraState = {
    view: identity(new Float32Array(16)),
    projection: identity(new Float32Array(16)),
    center: new Float32Array(props.center || 3),
    theta: props.theta || 0,
    phi: props.phi || 0,
    distance: Math.log(props.distance || 10.0),
    eye: new Float32Array(3),
    up: new Float32Array(props.up || [0, 1, 0])
  }

  const right = new Float32Array([1, 0, 0])
  const front = new Float32Array([0, 0, 1])

  const minDistance = Math.log('minDistance' in props ? props.minDistance : 0.1)
  const maxDistance = Math.log('maxDistance' in props ? props.maxDistance : 1000)

  let dtheta = 0
  let dphi = 0
  let ddistance = 0

  let prevX = 0
  let prevY = 0
  mouseChange(function (buttons, x, y) {
    if (buttons & 1) {
      const dx = (x - prevX) / window.innerWidth
      const dy = (y - prevY) / window.innerHeight
      const w = Math.max(cameraState.distance, 0.5)

      dtheta += w * dx
      dphi += w * dy
    }
    prevX = x
    prevY = y
  })

  mouseWheel(function (_, dy) {
    ddistance += dy / window.innerHeight
  })

  function damp(x) {
    const xd = x * 0.9
    if (Math.abs(xd) < 0.1) {
      return 0
    }
    return xd
  }

  function clamp(x, lo, hi) {
    return Math.min(Math.max(x, lo), hi)
  }

  function updateCamera() {
    const center = cameraState.center
    const eye = cameraState.eye
    const up = cameraState.up

    cameraState.theta += dtheta
    cameraState.phi = clamp(
      cameraState.phi + dphi,
      -Math.PI / 2.0,
      Math.PI / 2.0)
    cameraState.distance = clamp(
      cameraState.distance + ddistance,
      minDistance,
      maxDistance)

    dtheta = damp(dtheta)
    dphi = damp(dphi)
    ddistance = damp(ddistance)

    const theta = cameraState.theta
    const phi = cameraState.phi
    const r = Math.exp(cameraState.distance)

    const vf = r * Math.sin(theta) * Math.cos(phi)
    const vr = r * Math.cos(theta) * Math.cos(phi)
    const vu = r * Math.sin(phi)

    for (let i = 0; i < 3; ++i) {
      eye[i] = center[i] + vf * front[i] + vr * right[i] + vu * up[i]
    }

    lookAt(cameraState.view, eye, center, up)
  }

  const injectContext = regl({
    context: Object.assign({}, cameraState, {
      projection: function ({ viewportWidth, viewportHeight }) {
        return perspective(cameraState.projection,
          Math.PI / 4.0,
          viewportWidth / viewportHeight,
          0.01,
          1000.0)
      }
    }),
    uniforms: Object.keys(cameraState).reduce(function (uniforms, name) {
      uniforms[name] = regl.context(name)
      return uniforms
    }, {})
  })

  function setupCamera(block) {
    updateCamera()
    injectContext(block)
  }

  return {
    camera: setupCamera,
    cameraState
  }
}

export default createCamera
