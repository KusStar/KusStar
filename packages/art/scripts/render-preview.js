/* eslint-disable @typescript-eslint/no-var-requires */
const { voxToMeshData } = require('vox-to-mesh')
const { renderToGifPromise } = require('headless')
const fs = require('fs')
const path = require('path')

const ASSETS_DIR = path.join(__dirname, '../')
const SNAPSHOT_DIR = path.join(ASSETS_DIR, 'snapshot')

if (fs.existsSync(SNAPSHOT_DIR)) {
  fs.rmSync(SNAPSHOT_DIR, { force: true, recursive: true })
  fs.mkdirSync(SNAPSHOT_DIR)
}

const main = async () => {
  const promises = []
  const snapshot = []
  fs.readdirSync(ASSETS_DIR).forEach(file => {
    if (file.endsWith('.vox')) {
      const voxFile = path.join(ASSETS_DIR, file)
      const meshData = voxToMeshData(voxFile)
      const outFile = file.replace('.vox', '.gif')
      promises.push(
        renderToGifPromise(meshData, {
          height: 300,
          width: 300,
          fps: 60,
          duration: 5,
          outDir: path.join(ASSETS_DIR, 'snapshot'),
          outName: outFile
        })
      )
      snapshot.push({
        before: file,
        after: outFile
      })
    }
  })
  await Promise.all(promises)

  const README_FILE = path.join(ASSETS_DIR, 'README.md')
  const readmeMarkdown = fs.readFileSync(README_FILE, 'utf8')

  const snapshotMarkdown = snapshot.map(({ before, after }) =>
    `- [${before}](./${before})

![${before}](./snapshot/${after})`).join('\n\n')

  const outMarkdown = readmeMarkdown.replace(/## Snapshot.+/gms, `## Snapshot

${snapshotMarkdown}
  `)

  fs.writeFileSync(README_FILE, outMarkdown, { encoding: 'utf-8' })
}

main()
