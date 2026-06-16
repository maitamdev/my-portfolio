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
                    if (id.includes('node_modules'))
                    {
                        if (
                            id.includes('msgpack-lite') ||
                            id.includes('buffer') ||
                            id.includes('base64-js') ||
                            id.includes('ieee754') ||
                            id.includes('isarray') ||
                            id.includes('event-lite') ||
                            id.includes('int64-buffer') ||
                            id.includes('readable-stream') ||
                            id.includes('safe-buffer') ||
                            id.includes('string_decoder') ||
                            id.includes('util-deprecate') ||
                            id.includes('process') ||
                            id.includes('vm-browserify')
                        )
                        {
                            return 'server-codec'
                        }
                        if (id.includes('three'))
                        {
                            return 'three'
                        }
                        if (id.includes('rapier'))
                        {
                            return 'rapier'
                        }
                        return 'vendor'
                    }
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
