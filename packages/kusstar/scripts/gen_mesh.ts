import { voxToMeshFile } from '@kuss/vox-to-mesh'
import fs from 'fs'
import path from 'path'

const ART_DIR = path.join(__dirname, '../../art/assets')
const DIST_DIR = path.join(__dirname, '../dist')

const mkDist = () => fs.mkdirSync(DIST_DIR, { recursive: true })

if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true })
  mkDist()
} else {
  mkDist()
}

voxToMeshFile(path.join(ART_DIR, './kusstar.vox'), DIST_DIR, 'index')
