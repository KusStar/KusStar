/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')
const path = require('path')
const { voxToMesh } = require('vox-to-mesh')

const ART_DIR = path.join(__dirname, '../../art')
const DIST_DIR = path.join(__dirname, '../dist')

const mkDist = () => fs.mkdirSync(DIST_DIR, { recursive: true })

if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true })
  mkDist()
} else {
  mkDist()
}

voxToMesh(path.join(ART_DIR, './kusstar.vox'), DIST_DIR, 'index')
