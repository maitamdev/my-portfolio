import * as THREE from 'three/webgpu'
import { color, float, Fn, instancedArray, mix, normalWorld, positionGeometry, step, texture, uniform, uv, vec2, vec3, vec4 } from 'three/tsl'
import { Inputs } from '../../Inputs/Inputs.js'
import { InteractivePoints } from '../../InteractivePoints.js'
import { Area } from './Area.js'
import gsap from 'gsap'
import { MeshDefaultMaterial } from '../../Materials/MeshDefaultMaterial.js'

export class LandingArea extends Area
{
    constructor(model)
    {
        // 1. Rebuild letters array to spell "MAI TAM DEV" (11 characters)
        const text = ['M', 'A', 'I', ' ', 'T', 'A', 'M', ' ', 'D', 'E', 'V'];
        
        // Find existing reference letters
        const refLetters = model.children.filter(c => c.name.startsWith('refLetters'));
        
        // Remove them from model.children
        model.children = model.children.filter(c => !c.name.startsWith('refLetters'));
        
        // Sort original letters by x position (left-to-right)
        refLetters.sort((a, b) => a.position.x - b.position.x);
        
        // Get start and end positions for the line
        const startPos = refLetters[0].position.clone();
        const endPos = refLetters[refLetters.length - 1].position.clone();
        
        // Find the original material from the first letter (to reuse)
        const originalMaterial = refLetters[0].material;
        
        const newRefLetters = [];
        
        // Re-use or clone to create 11 letter groups
        for (let i = 0; i < text.length; i++) {
            let mesh;
            if (i < refLetters.length) {
                mesh = refLetters[i];
            } else {
                mesh = refLetters[0].clone();
            }
            mesh.name = `refLettersPhysicalDynamic${i.toString().padStart(3, '0')}`;
            
            // Interpolate position
            const t = i / (text.length - 1);
            mesh.position.lerpVectors(startPos, endPos, t);
            
            const char = text[i];
            if (char === ' ') {
                mesh.userData.preventAutoAdd = true;
                mesh.visible = false;
            } else {
                mesh.userData.preventAutoAdd = false;
                mesh.visible = true;
                
                // Clear original geometry (make it empty)
                if (mesh.geometry) {
                    mesh.geometry.dispose();
                    mesh.geometry = new THREE.BufferGeometry();
                }
                
                // Remove existing children except the cuboid collider
                const childrenToKeep = [];
                for (const child of [...mesh.children]) {
                    if (child.name.startsWith('cuboid')) {
                        childrenToKeep.push(child);
                        
                        // Adjust cuboid scale to match the character
                        if (char === 'I') {
                            child.scale.x = 0.4;
                        } else if (char === 'M') {
                            child.scale.x = 1.5;
                        } else {
                            child.scale.x = 1.2;
                        }
                    } else {
                        child.removeFromParent();
                    }
                }
                mesh.children = childrenToKeep;
                
                // Helper to create blocky parts
                const createBox = (w, h, d, px, py, pz, rx = 0, ry = 0, rz = 0) => {
                    const geo = new THREE.BoxGeometry(w, h, d);
                    const uvAttr = geo.attributes.uv;
                    if (uvAttr) {
                        for (let k = 0; k < uvAttr.count; k++) {
                            uvAttr.setXY(k, 0.7356297969818115, 0.5);
                        }
                        uvAttr.needsUpdate = true;
                    }
                    const subMesh = new THREE.Mesh(geo, originalMaterial);
                    subMesh.position.set(px, py, pz);
                    subMesh.rotation.set(rx, ry, rz);
                    return subMesh;
                };
                
                // Add the specific letter components
                if (char === 'M') {
                    mesh.add(createBox(0.22, 1.4, 0.4, -0.46, 0, 0));
                    mesh.add(createBox(0.22, 1.4, 0.4, 0.46, 0, 0));
                    mesh.add(createBox(0.2, 0.85, 0.4, -0.22, -0.05, 0, 0, 0, 0.5));
                    mesh.add(createBox(0.2, 0.85, 0.4, 0.22, -0.05, 0, 0, 0, -0.5));
                } else if (char === 'A') {
                    mesh.add(createBox(0.22, 1.42, 0.4, -0.26, 0, 0, 0, 0, -0.18));
                    mesh.add(createBox(0.22, 1.42, 0.4, 0.26, 0, 0, 0, 0, 0.18));
                    mesh.add(createBox(0.42, 0.22, 0.4, 0, -0.1, 0));
                } else if (char === 'I') {
                    mesh.add(createBox(0.25, 1.4, 0.4, 0, 0, 0));
                } else if (char === 'T') {
                    mesh.add(createBox(1.0, 0.25, 0.4, 0, 0.575, 0));
                    mesh.add(createBox(0.25, 1.15, 0.4, 0, -0.125, 0));
                } else if (char === 'D') {
                    mesh.add(createBox(0.25, 1.4, 0.4, -0.375, 0, 0));
                    mesh.add(createBox(0.55, 0.22, 0.4, 0.025, 0.59, 0));
                    mesh.add(createBox(0.55, 0.22, 0.4, 0.025, -0.59, 0));
                    mesh.add(createBox(0.25, 0.96, 0.4, 0.375, 0, 0));
                } else if (char === 'E') {
                    mesh.add(createBox(0.25, 1.4, 0.4, -0.35, 0, 0));
                    mesh.add(createBox(0.7, 0.25, 0.4, 0.125, 0.575, 0));
                    mesh.add(createBox(0.5, 0.22, 0.4, 0.025, 0, 0));
                    mesh.add(createBox(0.7, 0.25, 0.4, 0.125, -0.575, 0));
                } else if (char === 'V') {
                    mesh.add(createBox(0.25, 1.46, 0.4, -0.28, 0.03, 0, 0, 0, 0.22));
                    mesh.add(createBox(0.25, 1.46, 0.4, 0.28, 0.03, 0, 0, 0, -0.22));
                }
            }
            
            newRefLetters.push(mesh);
        }
        
        // Add rebuilt letters back to model
        model.children.push(...newRefLetters);
        
        super(model)
 
        this.localTime = uniform(0)
 
        this.setLetters()
        this.setKiosk()
        this.setControls()
        this.setBonfire()
        this.setAchievement()
    }
 
    setLetters()
    {
        const references = this.references.items.get('letters')
 
        for(const reference of references)
        {
            const object = reference.userData.object
            if (object && object.physical) {
                const physical = object.physical
                physical.colliders[0].setActiveEvents(this.game.RAPIER.ActiveEvents.CONTACT_FORCE_EVENTS)
                physical.colliders[0].setContactForceEventThreshold(5)
                physical.onCollision = (force, position) =>
                {
                    this.game.audio.groups.get('hitBrick').playRandomNext(force, position)
                }
            }
        }
    }

    setKiosk()
    {
        // Interactive point
        const interactivePoint = this.game.interactivePoints.create(
            this.references.items.get('kioskInteractivePoint')[0].position,
            'Map',
            InteractivePoints.ALIGN_RIGHT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                this.game.inputs.interactiveButtons.clearItems()
                this.game.modals.open('map')
                // interactivePoint.hide()
            },
            () =>
            {
                this.game.inputs.interactiveButtons.addItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            }
        )

        // this.game.map.items.get('map').events.on('close', () =>
        // {
        //     interactivePoint.show()
        // })
    }

    setControls()
    {
        // Interactive point
        const interactivePoint = this.game.interactivePoints.create(
            this.references.items.get('controlsInteractivePoint')[0].position,
            'Controls',
            InteractivePoints.ALIGN_RIGHT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                this.game.inputs.interactiveButtons.clearItems()
                this.game.menu.open('controls')
                interactivePoint.hide()
            },
            () =>
            {
                this.game.inputs.interactiveButtons.addItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            }
        )

        // Menu instance
        const menuInstance = this.game.menu.items.get('controls')

        menuInstance.events.on('close', () =>
        {
            interactivePoint.show()
        })

        menuInstance.events.on('open', () =>
        {
            if(this.game.inputs.mode === Inputs.MODE_GAMEPAD)
                menuInstance.tabs.goTo('gamepad')
            else if(this.game.inputs.mode === Inputs.MODE_MOUSEKEYBOARD)
                menuInstance.tabs.goTo('mouse-keyboard')
            else if(this.game.inputs.mode === Inputs.MODE_TOUCH)
                menuInstance.tabs.goTo('touch')
        })
    }

    setBonfire()
    {
        const position = this.references.items.get('bonfireHashes')[0].position

        // Particles
        let particles = null
        {
            const emissiveMaterial = this.game.materials.getFromName('emissiveOrangeRadialGradient')
    
            const count = 30
            const elevation = uniform(5)
            const positions = new Float32Array(count * 3)
            const scales = new Float32Array(count)
    
    
            for(let i = 0; i < count; i++)
            {
                const i3 = i * 3
    
                const angle = Math.PI * 2 * Math.random()
                const radius = Math.pow(Math.random(), 1.5) * 1
                positions[i3 + 0] = Math.cos(angle) * radius
                positions[i3 + 1] = Math.random()
                positions[i3 + 2] = Math.sin(angle) * radius
    
                scales[i] = 0.02 + Math.random() * 0.06
            }
            
            const positionAttribute = instancedArray(positions, 'vec3').toAttribute()
            const scaleAttribute = instancedArray(scales, 'float').toAttribute()
    
            const material = new THREE.SpriteNodeMaterial()
            material.outputNode = emissiveMaterial.outputNode
    
            const progress = float(0).toVar()
    
            material.positionNode = Fn(() =>
            {
                const newPosition = positionAttribute.toVar()
                progress.assign(newPosition.y.add(this.localTime.mul(newPosition.y)).fract())
    
                newPosition.y.assign(progress.mul(elevation))
                newPosition.xz.addAssign(this.game.wind.direction.mul(progress))
    
                const progressHide = step(0.8, progress).mul(100)
                newPosition.y.addAssign(progressHide)
                
                return newPosition
            })()
            material.scaleNode = Fn(() =>
            {
                const progressScale = progress.remapClamp(0.5, 1, 1, 0)
                return scaleAttribute.mul(progressScale)
            })()
    
            const geometry = new THREE.CircleGeometry(0.5, 8)
    
            particles = new THREE.Mesh(geometry, material)
            particles.visible = false
            particles.position.copy(position)
            particles.count = count
            this.game.scene.add(particles)
        }

        // Hashes
        {
            const alphaNode = Fn(() =>
            {
                const baseUv = uv(1)
                const distanceToCenter = baseUv.sub(0.5).length()
    
                const voronoi = texture(
                    this.game.noises.voronoi,
                    baseUv
                ).g
    
                voronoi.subAssign(distanceToCenter.remap(0, 0.5, 0.3, 0))
    
                return voronoi
            })()
    
            const material = new MeshDefaultMaterial({
                colorNode: color(0x6F6A87),
                alphaNode: alphaNode,
                hasWater: false,
                hasLightBounce: false
            })
    
            const mesh = this.references.items.get('bonfireHashes')[0]
            mesh.material = material
        }

        // Burn
        const burn = this.references.items.get('bonfireBurn')[0]
        burn.visible = false

        // Interactive point
        this.game.interactivePoints.create(
            this.references.items.get('bonfireInteractivePoint')[0].position,
            'Res(e)t',
            InteractivePoints.ALIGN_RIGHT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                this.game.reset()

                gsap.delayedCall(2, () =>
                {
                    // Bonfire
                    particles.visible = true
                    burn.visible = true
                    this.game.ticker.wait(2, () =>
                    {
                        particles.geometry.boundingSphere.center.y = 2
                        particles.geometry.boundingSphere.radius = 2
                    })

                    // Sound
                    this.game.audio.groups.get('campfire').items[0].positions.push(position)
                })
            },
            () =>
            {
                this.game.inputs.interactiveButtons.addItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            }
        )
    }

    setAchievement()
    {
        this.events.on('boundingIn', () =>
        {
            this.game.achievements.setProgress('areas', 'landing')
        })
        this.events.on('boundingOut', () =>
        {
            this.game.achievements.setProgress('landingLeave', 1)
        })
    }

    update()
    {
        this.localTime.value += this.game.ticker.deltaScaled * 0.1
    }
}