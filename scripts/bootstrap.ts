import { execSync } from 'child_process'
import ora from 'ora'

const buildVox = ora('Building vox-to-mesh').start()
execSync('pnpm build --filter vox-to-mesh')
buildVox.succeed('Built vox-to-mesh')

const buildHeadless = ora('Building headless').start()
execSync('pnpm build --filter headless')
buildHeadless.succeed('Built headless')

const buildKusstar = ora('Generating kusstar mesh').start()
execSync('pnpm gen --filter kusstar')
buildKusstar.succeed('Generated kusstar')
