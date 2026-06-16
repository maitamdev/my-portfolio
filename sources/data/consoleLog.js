import * as THREE from 'three/webgpu'

const text = `
========================================
 MaiTamDev Portfolio
========================================

Intro
  Thank you for visiting my portfolio.
  This is a custom 3D developer portfolio built with Three.js and Rapier.

Socials
  Mail      => maitamit062005@gmail.com
  Facebook  => https://www.facebook.com/maitamdvfb
  GitHub    => https://github.com/maitamdev
  LinkedIn  => https://linkedin.com/in/maitamdev

Debug
  Add #debug to the URL and reload to open debug mode.
  Press [V] to toggle the free camera.

Three.js
  Rendering library release: ${THREE.REVISION}
  https://threejs.org/

Source code
  https://github.com/maitamdev/my-portfolio

More links
  Rapier    => https://rapier.rs/
  Howler.js => https://howlerjs.com/
========================================
`

const style = 'color: #ffffff; font: 400 1em monospace;'

export default [text, style]
