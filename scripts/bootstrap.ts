import { execSync } from 'child_process'
import ora from 'ora'

const buildVox = ora('Building vox-to-mesh').start()
execSync('pnpm --filter @kuss/vox-to-mesh build ')
buildVox.succeed('Built vox-to-mesh')

const buildHeadless = ora('Building headless').start()
execSync('pnpm --filter @kuss/headless build')
buildHeadless.succeed('Built headless')

const buildKusstar = ora('Generating kusstar mesh').start()
execSync('pnpm --filter kusstar gen')
buildKusstar.succeed('Generated kusstar')
