import * as THREE from 'three/webgpu'

const text = `
========================================
 MaiTamDev · Fullstack Developer
========================================

About
  Software Engineering student from Vietnam.
  Building AI-powered web & mobile products.
  Company: ANTISCAM VN

Stack
  React · Next.js · TypeScript · Flutter
  Firebase · Supabase · Python · Vite

Featured
  Anti-Scam     => https://anti-scam-kappa.vercel.app
  9Router       => https://9router.com
  DHV Guiding   => https://dhv-guiding-light.vercel.app
  SCS GO        => https://scs-go.vercel.app
  SORA POS      => https://sora-pos.vercel.app

Socials
  Website   => https://maitamsite.site
  GitHub    => https://github.com/maitamdev
  LinkedIn  => https://linkedin.com/in/maitam-dev-403220399
  Mail      => maitamit062005@gmail.com
  Facebook  => https://www.facebook.com/maitamdvfb

Debug
  Add #debug to the URL and reload.
  Press [V] to toggle free camera.

Three.js r${THREE.REVISION}
  https://threejs.org/
========================================
`

const style = 'color: #ffffff; font: 400 1em monospace;'

export default [text, style]
