import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/extension.ts',
  ],
  treeshake: true,
  external: [
    'vscode',
  ],
  format: [
    'cjs',
  ],
  shims: false,
})
