export type MeshData = {
  positions: number[][]
  cells: number[][]
  normals: number[]
  colors: number[]
}
export const voxToMeshData: (voxFile: string) => MeshData

export const voxToMeshFile: (voxFile: string, outDir: string, name: string) => void
