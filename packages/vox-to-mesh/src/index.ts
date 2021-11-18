import fs from 'fs'
import path from 'path'
import { flatten } from 'ramda'
import readVox from 'vox-reader'
import voxelTriangulation from 'voxel-triangulation'
import zeros from 'zeros'

export type MeshData = {
  positions: number[][]
  cells: number[][]
  normals: number[]
  colors: number[]
}

export const voxToMeshData = (voxFile: string): MeshData => {
  const voxData = fs.readFileSync(voxFile)

  const vox = readVox(voxData)

  const voxelData = vox.xyzi.values
  const size = vox.size
  const rgba = vox.rgba.values

  const componentizedColores = rgba.map((c) => [c.r, c.g, c.b])
  let voxels = zeros([size.x, size.y, size.z])

  voxelData.forEach(({ x, y, z, i }) => voxels.set(x, y, z, i))

  voxels = voxels.transpose(1, 2, 0)

  const { vertices, normals, indices, voxelValues } = voxelTriangulation(voxels)

  const normalizedColors = componentizedColores.map((color) => color.map((c) => c / 2 ** 8))
  const alignedColors = [[0, 0, 0], ...normalizedColors]
  const colors = flatten(voxelValues.map((v) => alignedColors[v]))

  return {
    positions: vertices,
    cells: indices,
    normals,
    colors
  }
}

const writeToFile = (outDir, name, data) => {
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true })
  }
  fs.writeFileSync(path.join(outDir, name), data, { encoding: 'utf8' })
}

export const voxToMeshFile = (voxFile: string, outputDir: string, name: string) => {
  const {
    positions: _positions,
    cells: _cells,
    normals: _normals,
    colors: _colors
  } = voxToMeshData(voxFile)
  console.log(`meshData:
    positions: ${_positions.length}
    cells: ${_cells.length}
    normals: ${_normals.length}
    colors: ${_colors.length}
  `)
  const positions = JSON.stringify(_positions)
  const cells = JSON.stringify(_cells)
  const colors = JSON.stringify(_colors)
  const normal = JSON.stringify(_normals)

  const cjs = `exports.positions = ${positions};
exports.cells = ${cells};
exports.colors = ${colors};
exports.normals = ${normal};
  `
  const mjs = `export const positions = ${positions}
export const cells = ${cells}
export const colors = ${colors}
export const normals = ${normal}
`

  const typings = `export const positions: number[][];
export const cells: number[][];
export const colors: number[];
export const normals: number[];
`

  writeToFile(outputDir, `${name}.cjs`, cjs)
  writeToFile(outputDir, `${name}.mjs`, mjs)
  writeToFile(outputDir, `${name}.d.ts`, typings)
}
