import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import restart from 'vite-plugin-restart'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const projectDirectory = path.dirname(fileURLToPath(import.meta.url))
const staticDirectory = path.resolve(projectDirectory, 'static')
const distDirectory = path.resolve(projectDirectory, 'dist')

const shouldCopyStaticAsset = (source) =>
{
    const relativePath = path.relative(staticDirectory, source).replaceAll(path.sep, '/')

    if(!relativePath)
        return true

    if(relativePath.endsWith('.wav'))
        return false

    if(relativePath.startsWith('draco/gltf/'))
        return false

    if(relativePath === 'draco/draco_encoder.js')
        return false

    return true
}

const copyStaticAssets = () => ({
    name: 'copy-filtered-static-assets',
    apply: 'build',
    async closeBundle()
    {
        await fs.cp(
            staticDirectory,
            distDirectory,
            {
                recursive: true,
                force: true,
                filter: shouldCopyStaticAsset,
            }
        )
    }
})

export default {
    root: 'sources/', // Sources files (typically where index.html is)
    envDir: '../',  // Directory where the env file is located
    publicDir: '../static/', // Path from "root" to static assets (files that are served as they are)
    base: './', // Public path (what's after the domain)
    server:
    {
        // https: true,
        host: true, // Open to local network and display URL
        open: true // Open in browser
    },
    build:
    {
        outDir: '../dist', // Output in the dist/ folder
        emptyOutDir: true, // Empty the folder first
        copyPublicDir: false,
        sourcemap: false, // Add sourcemap
        rollupOptions:
        {
            output:
            {
                manualChunks(id)
                {
                    // Normalize for Windows/Unix and Vite virtual modules
                    const normalizedId = id.replaceAll('\\', '/')

                    if (!normalizedId.includes('node_modules'))
                        return

                    // Keep Three intact first: broad matches like "buffer"/"process"
                    // otherwise pull BufferGeometry/etc. into another chunk and cause
                    // TDZ errors such as "Cannot access 'Texture' before initialization".
                    if (normalizedId.includes('/three/') || normalizedId.includes('/three@'))
                        return 'three'

                    if (normalizedId.includes('/@dimforge/rapier3d') || normalizedId.includes('/rapier'))
                        return 'rapier'

                    const serverCodecPackages = [
                        '/msgpack-lite/',
                        '/buffer/',
                        '/base64-js/',
                        '/ieee754/',
                        '/isarray/',
                        '/event-lite/',
                        '/int64-buffer/',
                        '/readable-stream/',
                        '/safe-buffer/',
                        '/string_decoder/',
                        '/util-deprecate/',
                        '/process/',
                        '/vm-browserify/',
                    ]

                    if (serverCodecPackages.some((pkg) => normalizedId.includes(pkg)))
                        return 'server-codec'

                    return 'vendor'
                }
            }
        }
    },
    plugins:
    [
        wasm(),
        topLevelAwait(),
        restart({ restart: [ '../static/**', ] }), // Restart server on static file change
        copyStaticAssets(),
        nodePolyfills(),
        // basicSsl()
    ]
}
