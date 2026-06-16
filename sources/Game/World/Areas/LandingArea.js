import * as THREE from 'three/webgpu'
import { color, float, Fn, instancedArray, mix, normalWorld, positionGeometry, step, texture, uniform, uv, vec2, vec3, vec4 } from 'three/tsl'
import { Inputs } from '../../Inputs/Inputs.js'
import { InteractivePoints } from '../../InteractivePoints.js'
import { Area } from './Area.js'
import gsap from 'gsap'
import { MeshDefaultMaterial } from '../../Materials/MeshDefaultMaterial.js'
import { Game } from '../../Game.js'
import { InstancedGroup } from '../../InstancedGroup.js'
import { Trees } from '../Trees.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'


export class LandingArea extends Area
{
    constructor(model)
    {
        // 1. Rebuild letters array to spell "MAI TAM DEV" (11 characters)
        const text = ['M', 'A', 'I', ' ', 'T', 'A', 'M', ' ', 'D', 'E', 'V'];
        
        // Find existing reference letters by traversing the model
        const refLetters = [];
        model.traverse(c => {
            if (c.name.match(/^ref(?:erence)?Letters/i)) {
                refLetters.push(c);
            }
        });
        
        // Remove them from their parents
        for (const c of refLetters) {
            c.removeFromParent();
        }
        
        // Sort original letters by x position (left-to-right)
        refLetters.sort((a, b) => a.position.x - b.position.x);
        
        let originalMaterial = null;
        let newRefLetters = [];
        
        if (refLetters.length > 0) {
            // Get start and end positions for the line
            const startPos = refLetters[0].position.clone();
            const endPos = refLetters[refLetters.length - 1].position.clone();

            // Shift the entire line to the left to avoid grass hiding "DEV"
            const direction = endPos.clone().sub(startPos).normalize();
            const shiftAmount = -2.5; // Negative to move left (towards startPos)
            startPos.addScaledVector(direction, shiftAmount);
            endPos.addScaledVector(direction, shiftAmount);
            
            // Find the original material from the first letter (to reuse)
            originalMaterial = refLetters[0].material;
            
            // Find original cuboid for physics
            let originalCuboid = null;
            for (const child of refLetters[0].children) {
                if (child.name.startsWith('cuboid')) {
                    originalCuboid = child;
                    break;
                }
            }
            
            // Re-use or clone to create 11 letter groups
            for (let i = 0; i < text.length; i++) {
                const group = new THREE.Group();
                group.name = `refLettersPhysicalDynamic${i.toString().padStart(3, '0')}`;
                
                // Copy userData, rotation, and scale from original
                group.userData = { ...refLetters[0].userData };
                group.rotation.copy(refLetters[0].rotation);
                group.scale.copy(refLetters[0].scale);
                
                // Interpolate position
                const t = i / (text.length - 1);
                group.position.lerpVectors(startPos, endPos, t);
                
                const char = text[i];
                if (char === ' ') {
                    group.userData.preventAutoAdd = true;
                    group.visible = false;
                } else {
                    group.userData.preventAutoAdd = false;
                    group.visible = true;
                    
                    // Add physical cuboid
                    if (originalCuboid) {
                        const thickness = 0.4;
                        const cuboid = originalCuboid.clone();
                        cuboid.scale.set(1.2, 1.5, thickness * 1.5);
                        group.add(cuboid);
                    }
                }
                
                newRefLetters.push(group);
            }
            
            // Add rebuilt letters back to model so super() handles them
            model.add(...newRefLetters);
        }
        
        super(model)

        this.localTime = uniform(0)
        
        if (originalMaterial && newRefLetters.length > 0) {
            const game = Game.getInstance()
            const updatedMaterial = game.materials.getFromName(originalMaterial.name, originalMaterial)
            
            // Asynchronously load font and generate beautiful 3D text
            const loader = new FontLoader();
            loader.load('fonts/helvetiker_bold.typeface.json', (font) => {
                for (let i = 0; i < text.length; i++) {
                    const char = text[i];
                    if (char === ' ') continue;
                    
                    const group = newRefLetters[i];
                    
                    const textGeo = new TextGeometry(char, {
                        font: font,
                        size: 1.2,
                        depth: 0.25,
                        curveSegments: 5,
                        bevelEnabled: true,
                        bevelThickness: 0.05,
                        bevelSize: 0.02,
                        bevelOffset: 0,
                        bevelSegments: 4
                    });
                    
                    textGeo.computeBoundingBox();
                    const centerOffsetX = -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);
                    const centerOffsetY = -0.5 * (textGeo.boundingBox.max.y - textGeo.boundingBox.min.y);
                    textGeo.translate(centerOffsetX, centerOffsetY, -0.125);
                    
                    const uvAttr = textGeo.attributes.uv;
                    if (uvAttr) {
                        for (let k = 0; k < uvAttr.count; k++) {
                            uvAttr.setXY(k, 0.7356297969818115, 0.5);
                        }
                        uvAttr.needsUpdate = true;
                    }
                    
                    const textMesh = new THREE.Mesh(textGeo, updatedMaterial);
                    textMesh.castShadow = true;
                    textMesh.receiveShadow = true;
                    
                    group.add(textMesh);
                }
            });
        }
 
        this.setLetters()
        this.setKiosk()
        this.setControls()
        this.setBonfire()
        this.setAchievement()
        this.setDestructionPark()
        this.setChillSpot()
    }
 
    setChillSpot()
    {
        const position = new THREE.Vector3(-80, 0.5, -80)

        // 0. Add Trees (A Secret Grove)
        // Create mock references for Oak and Birch trees
        const oakReferences = []
        const birchReferences = []
        for(let i = 0; i < 8; i++)
        {
            const angle = (i / 8) * Math.PI * 2
            const r = 12 + Math.random() * 4 // Radius 12-16
            
            const ref = new THREE.Object3D()
            ref.position.set(position.x + Math.cos(angle) * r, 0, position.z + Math.sin(angle) * r)
            ref.rotation.y = Math.random() * Math.PI * 2
            const s = 0.8 + Math.random() * 0.6
            ref.scale.set(s, s, s)
            ref.updateMatrix()
            ref.updateMatrixWorld()

            if (i % 2 === 0) oakReferences.push(ref)
            else birchReferences.push(ref)
        }

        this.chillOakTrees = new Trees('Chill Oak Trees', this.game.resources.oakTreesVisualModel.scene, oakReferences, '#b4b536', '#d8cf3b')
        this.chillBirchTrees = new Trees('Chill Birch Trees', this.game.resources.birchTreesVisualModel.scene, birchReferences, '#ff4f2b', '#ff903f')

        // 0.5 Add Benches
        const [ benchBase ] = InstancedGroup.getBaseAndReferencesFromInstances(this.game.resources.benchesModel.scene.children)
        const descriptions = this.game.objects.getFromModel(benchBase, {}, {})

        for(let i = 0; i < 3; i++)
        {
            const angle = (i / 3) * Math.PI * 2
            const r = 4 // Closer to center
            const bench = benchBase.clone()
            bench.position.set(position.x + Math.cos(angle) * r, 0, position.z + Math.sin(angle) * r)
            bench.rotation.y = -angle + Math.PI / 2
            bench.updateMatrixWorld()

            this.game.objects.add(
                {
                    model: bench,
                    updateMaterials: false,
                },
                {
                    type: 'dynamic',
                    position: bench.position,
                    rotation: bench.quaternion,
                    friction: 0.7,
                    mass: 0.1,
                    sleeping: true,
                    colliders: descriptions[1].colliders,
                    waterGravityMultiplier: - 1,
                    contactThreshold: 10
                }
            )
        }

        // 1. Fireflies (Whispers/Particles)
        const emissiveMaterial = this.game.materials.getFromName('emissiveGreenRadialGradient') || this.game.materials.getFromName('emissiveOrangeRadialGradient')
        const count = 100
        const elevation = uniform(10)
        const positions = new Float32Array(count * 3)
        const scales = new Float32Array(count)

        for(let i = 0; i < count; i++)
        {
            const i3 = i * 3
            const angle = Math.PI * 2 * Math.random()
            const radius = Math.pow(Math.random(), 1.5) * 15 // Wide area
            positions[i3 + 0] = Math.cos(angle) * radius
            positions[i3 + 1] = Math.random()
            positions[i3 + 2] = Math.sin(angle) * radius
            scales[i] = 0.05 + Math.random() * 0.1
        }
        
        const positionAttribute = instancedArray(positions, 'vec3').toAttribute()
        const scaleAttribute = instancedArray(scales, 'float').toAttribute()

        const material = new THREE.SpriteNodeMaterial()
        material.outputNode = emissiveMaterial.outputNode
        const progress = float(0).toVar()

        material.positionNode = Fn(() =>
        {
            const newPosition = positionAttribute.toVar()
            // Slower animation
            progress.assign(newPosition.y.add(this.localTime.mul(0.1).mul(newPosition.y)).fract())

            newPosition.y.assign(progress.mul(elevation))
            newPosition.xz.addAssign(this.game.wind.direction.mul(progress).mul(2.0))

            const progressHide = step(0.9, progress).mul(100)
            newPosition.y.addAssign(progressHide)
            
            return newPosition
        })()
        material.scaleNode = Fn(() =>
        {
            const progressScale = progress.remapClamp(0.5, 1, 1, 0)
            return scaleAttribute.mul(progressScale)
        })()

        const geometry = new THREE.CircleGeometry(0.5, 8)
        const particles = new THREE.Mesh(geometry, material)
        particles.position.copy(position)
        particles.count = count
        this.game.scene.add(particles)

        // 2. A Magical Glowing Light
        const pointLight = new THREE.PointLight(0x44ff88, 5, 20)
        pointLight.position.copy(position)
        pointLight.position.y += 2
        pointLight.castShadow = true
        this.game.scene.add(pointLight)

        // 3. A Glowing Center Crystal
        const crystalGeo = new THREE.DodecahedronGeometry(0.8)
        const crystalMat = new THREE.MeshStandardMaterial({ 
            color: 0x44ff88, 
            emissive: 0x44ff88, 
            emissiveIntensity: 2, 
            roughness: 0.2, 
            metalness: 0.8 
        })
        const crystal = new THREE.Mesh(crystalGeo, crystalMat)
        crystal.position.copy(position)
        crystal.position.y += 1
        this.game.scene.add(crystal)
        
        // Add physics to crystal
        this.game.objects.add(
            { model: crystal },
            { type: 'fixed', colliders: [{ shape: 'cuboid', parameters: [0.8, 0.8, 0.8] }] }
        )

        // Spin crystal
        this.game.ticker.events.on('tick', () => {
            crystal.rotation.y += 0.01
            crystal.rotation.x += 0.005
            crystal.position.y = position.y + 1 + Math.sin(this.game.ticker.elapsedScaled * 0.5) * 0.2
        })

        // 4. Interactive Point (Sit and Chill)
        this.game.interactivePoints.create(
            new THREE.Vector3(position.x, position.y + 1, position.z),
            'Enjoy the vibe',
            InteractivePoints.ALIGN_CENTER,
            InteractivePoints.STATE_DEFAULT,
            () =>
            {
                // Action: Focus camera on the chill spot and play sound
                this.game.audio.groups.get('click')?.play(true)
                // Disable tracking so the camera locks onto the chill spot
                this.game.view.focusPoint.isTracking = false
                this.game.view.focusPoint.position.copy(position)
                this.game.view.focusPoint.smoothedPosition.copy(position)
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

    setDestructionPark()
    {
        // 1. Pyramid of boxes
        const boxSize = 0.8
        const boxGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize)
        
        const startX = -10
        const startZ = -15
        const rows = 5

        for(let y = 0; y < rows; y++) {
            for(let x = 0; x < rows - y; x++) {
                for(let z = 0; z < rows - y; z++) {
                    const material = new MeshDefaultMaterial({ 
                        colorNode: color(new THREE.Color().setHSL(Math.random() * 0.2 + 0.5, 0.8, 0.5)) // Blue-ish tones
                    })
                    const mesh = new THREE.Mesh(boxGeometry, material)
                    mesh.castShadow = true
                    mesh.receiveShadow = true
                    
                    const posX = startX + x * boxSize + (y * boxSize * 0.5)
                    const posY = y * boxSize + boxSize * 0.5
                    const posZ = startZ + z * boxSize + (y * boxSize * 0.5)

                    this.game.objects.add(
                        {
                            model: mesh,
                            parent: this.game.scene
                        },
                        {
                            type: 'dynamic',
                            sleeping: true,
                            position: { 
                                x: posX + this.model.position.x, 
                                y: posY, 
                                z: posZ + this.model.position.z 
                            },
                            mass: 0.1,
                            friction: 0.4,
                            colliders: [
                                { shape: 'cuboid', parameters: [boxSize/2, boxSize/2, boxSize/2] }
                            ],
                            onCollision: (force, position) =>
                            {
                                this.game.audio.groups.get('hitDefault').playRandomNext(force, position)
                            }
                        }
                    )
                }
            }
        }

        // 2. Wall of barrels
        const radius = 0.5
        const height = 1.2
        const barrelGeometry = new THREE.CylinderGeometry(radius, radius, height, 16)
        
        const wallZ = -10
        const wallStartX = 10
        const wallCols = 10
        const wallRows = 3

        for(let y = 0; y < wallRows; y++) {
            for(let x = 0; x < wallCols; x++) {
                const material = new MeshDefaultMaterial({ 
                    colorNode: color(new THREE.Color().setHSL(Math.random() * 0.2 + 0.05, 0.9, 0.5)) // Orange/Red tones
                })
                const mesh = new THREE.Mesh(barrelGeometry, material)
                mesh.castShadow = true
                mesh.receiveShadow = true
                
                const posX = wallStartX + x * (radius * 2.1) + (y % 2 === 0 ? 0 : radius * 1.05)
                const posY = y * height + height * 0.5
                const posZ = wallZ

                this.game.objects.add(
                    {
                        model: mesh,
                        parent: this.game.scene
                    },
                    {
                        type: 'dynamic',
                        sleeping: true,
                        position: { 
                            x: posX + this.model.position.x, 
                            y: posY, 
                            z: posZ + this.model.position.z 
                        },
                        mass: 0.2,
                        friction: 0.5,
                        colliders: [
                            { shape: 'cylinder', parameters: [height/2, radius] }
                        ],
                        onCollision: (force, position) =>
                        {
                            this.game.audio.groups.get('hitDefault').playRandomNext(force, position)
                        }
                    }
                )
            }
        }
    }

    update()
    {
        this.localTime.value += this.game.ticker.deltaScaled * 0.1
    }
}
