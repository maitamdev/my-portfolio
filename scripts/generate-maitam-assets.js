/**
 * Generate MaiTamDev replacement assets (career labels, lab cards, share, time machine).
 * Run: node scripts/generate-maitam-assets.js
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const staticDir = path.join(root, 'static')

const escapeXml = (value) =>
    String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&apos;')

async function writePng(filePath, buffer)
{
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, buffer)
    console.log('wrote', path.relative(root, filePath))
}

async function careerLabel({ file, width, height, lines, accent = '#7dd3fc' })
{
    const fontSize = lines.length > 1 ? 28 : 34
    const lineHeight = fontSize + 6
    const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2 + fontSize * 0.35

    const textNodes = lines.map((line, index) =>
    {
        const y = startY + index * lineHeight
        return `<text x="50%" y="${y}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="700" fill="#ffffff">${escapeXml(line)}</text>`
    }).join('')

    const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect x="2" y="2" width="${width - 4}" height="${height - 4}" fill="none" stroke="${accent}" stroke-width="3" rx="8"/>
  ${textNodes}
</svg>`

    const buffer = await sharp(Buffer.from(svg)).png().toBuffer()
    await writePng(path.join(staticDir, 'career', file), buffer)
}

async function cardImage({ file, width, height, title, subtitle, accent })
{
    const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="55%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="${accent}"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <circle cx="${width * 0.82}" cy="${height * 0.22}" r="${Math.min(width, height) * 0.18}" fill="${accent}" opacity="0.25"/>
  <circle cx="${width * 0.12}" cy="${height * 0.78}" r="${Math.min(width, height) * 0.22}" fill="#38bdf8" opacity="0.18"/>
  <text x="48" y="${height * 0.42}" font-family="Arial, Helvetica, sans-serif" font-size="${Math.round(width * 0.055)}" font-weight="800" fill="#f8fafc">${escapeXml(title)}</text>
  <text x="48" y="${height * 0.55}" font-family="Arial, Helvetica, sans-serif" font-size="${Math.round(width * 0.028)}" font-weight="600" fill="#cbd5e1">${escapeXml(subtitle)}</text>
  <text x="48" y="${height * 0.86}" font-family="Arial, Helvetica, sans-serif" font-size="${Math.round(width * 0.022)}" font-weight="700" fill="#7dd3fc">MaiTamDev</text>
</svg>`

    const buffer = await sharp(Buffer.from(svg)).png().toBuffer()
    await writePng(file, buffer)
}

async function pixelScreen({ file, width, height, lines, accent = '#22d3ee' })
{
    const fontSize = 14
    const startY = 28
    const textNodes = lines.map((line, index) =>
        `<text x="10" y="${startY + index * 18}" font-family="Courier New, monospace" font-size="${fontSize}" font-weight="700" fill="${accent}">${escapeXml(line)}</text>`
    ).join('')

    const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#020617"/>
  <rect x="4" y="4" width="${width - 8}" height="${height - 8}" fill="none" stroke="${accent}" stroke-width="2"/>
  ${textNodes}
</svg>`

    const buffer = await sharp(Buffer.from(svg)).png().toBuffer()
    await writePng(path.join(staticDir, 'timeMachine', file), buffer)
}

async function shareImage()
{
    const width = 1200
    const height = 630
    const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="100%" stop-color="#0ea5e9"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <text x="80" y="230" font-family="Arial, Helvetica, sans-serif" font-size="84" font-weight="800" fill="#f8fafc">MaiTamDev</text>
  <text x="80" y="310" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="600" fill="#e2e8f0">Fullstack Developer · Vietnam</text>
  <text x="80" y="380" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="500" fill="#bae6fd">AI Web · Mobile · Open Source · ANTISCAM VN</text>
  <text x="80" y="480" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="600" fill="#7dd3fc">github.com/maitamdev  ·  maitamsite.site</text>
  <text x="80" y="540" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="500" fill="#94a3b8">9Router · Anti-Scam · DHV Guiding Light · SCS GO</text>
</svg>`

    const buffer = await sharp(Buffer.from(svg)).png().toBuffer()
    await writePng(path.join(staticDir, 'social', 'share-image.png'), buffer)
}

const labItems = [
    { slug: 'flutter-club', title: 'Flutter Club', subtitle: 'Campus club hub · TypeScript', accent: '#14b8a6' },
    { slug: 'dhv-lingoo', title: 'DHV Lingoo', subtitle: 'Language learning web app', accent: '#ec4899' },
    { slug: 'travelviet-ai', title: 'TravelViet AI', subtitle: 'AI travel planner for Vietnam', accent: '#0ea5e9' },
    { slug: 'courseai', title: 'CourseAI', subtitle: 'AI course generation platform', accent: '#8b5cf6' },
    { slug: 'interview-practice', title: 'Interview Practice', subtitle: 'Coding interview trainer', accent: '#64748b' },
    { slug: 'uml-gen', title: 'UML Generator', subtitle: 'AI diagrams from natural language', accent: '#a855f7' },
    { slug: 'build-chatgpt', title: 'Build ChatGPT', subtitle: 'LLM from scratch · Python', accent: '#3b82f6' },
    { slug: '2048-ai', title: '2048 AI', subtitle: 'AI-powered 2048 game', accent: '#f97316' },
    { slug: 'smart-practice', title: 'Smart Practice', subtitle: 'Practice & learning tools', accent: '#06b6d4' },
    { slug: 'codemind', title: 'CodeMind', subtitle: 'AI coding assistant experiment', accent: '#22c55e' },
    { slug: 'eng-ai', title: 'Eng-AI', subtitle: 'English learning with AI', accent: '#eab308' },
    { slug: 'edu-lab', title: 'Edu Lab', subtitle: 'Education lab experiments', accent: '#f43f5e' },
    { slug: 'classic-portfolio', title: 'Classic Portfolio', subtitle: 'Web portfolio · maitam-pf', accent: '#38bdf8' },
]

async function main()
{
    // Career labels (filenames must match GLB userData.texture keys)
    await careerLabel({ file: 'careerUzik.png', width: 168, height: 60, lines: ['DHV SE'], accent: '#38bdf8' })
    await careerLabel({ file: 'careerFreelancer.png', width: 240, height: 60, lines: ['Web Dev'], accent: '#22c55e' })
    await careerLabel({ file: 'careerHetic.png', width: 316, height: 60, lines: ['Anti-Scam VN'], accent: '#ef4444' })
    await careerLabel({ file: 'careerImmersiveGarden.png', width: 340, height: 60, lines: ['AI Products'], accent: '#a78bfa' })
    await careerLabel({ file: 'careerIRLTeacher.png', width: 268, height: 92, lines: ['Flutter', 'Mobile'], accent: '#fbbf24' })
    await careerLabel({ file: 'careerOnlineTeacher.png', width: 332, height: 92, lines: ['Open Source', 'Builder'], accent: '#2dd4bf' })

    // Time machine screens
    await pixelScreen({
        file: 'timeMachineScreenFolio.png',
        width: 140,
        height: 124,
        lines: ['MAITAMDEV', '3D FOLIO', 'FULLSTACK', '2026'],
        accent: '#22d3ee',
    })
    await pixelScreen({
        file: 'timeMachineScreenMGS.png',
        width: 140,
        height: 124,
        lines: ['ANTISCAM', '9ROUTER', 'DHV LIGHT', 'SCS GO'],
        accent: '#4ade80',
    })

    await shareImage()

    // Lab cards (png only — LabArea will load png)
    for(const item of labItems)
    {
        const full = path.join(staticDir, 'lab', 'images', `${item.slug}.png`)
        const mini = path.join(staticDir, 'lab', 'images', `${item.slug}-mini.png`)
        await cardImage({ file: full, width: 960, height: 540, title: item.title, subtitle: item.subtitle, accent: item.accent })
        await cardImage({ file: mini, width: 240, height: 136, title: item.title, subtitle: item.subtitle, accent: item.accent })
    }

    console.log('Done generating MaiTamDev assets.')
}

main().catch((error) =>
{
    console.error(error)
    process.exit(1)
})
