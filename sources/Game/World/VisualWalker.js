import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'

/**
 * Animated character from GLB (Three.js Soldier — Idle / Walk / Run).
 * Same presentation idea as VisualVehicle, driven by PhysicsWalker.
 */
export class VisualWalker
{
    constructor(gltf)
    {
        this.game = Game.getInstance()
        this.visible = false
        this.gltf = gltf

        this.group = new THREE.Group()
        this.group.visible = false
        this.game.scene.add(this.group)

        this.model = null
        this.mixer = null
        this.actions = {}
        this.currentAction = null
        this.fadeDuration = 0.22

        // Soldier ~1.8m; slight upscale next to the car
        this.modelScale = 1.15
        // Physics body origin ≈ feet / ground contact (ball bottom at local y=0)
        // Model root is shifted so feet sit at group y=0
        this.yawOffset = -Math.PI * 0.5

        this.setModel()
        this.setAnimations()

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 8)
    }

    setModel()
    {
        // Single instance — use scene root directly (keeps skinning intact)
        this.model = this.gltf.scene
        this.model.scale.setScalar(this.modelScale)
        this.model.position.set(0, 0, 0)

        this.model.traverse((child) =>
        {
            if(child.isMesh || child.isSkinnedMesh)
            {
                child.castShadow = true
                child.receiveShadow = true
                child.frustumCulled = false

                const materials = Array.isArray(child.material) ? child.material : [ child.material ]
                for(const mat of materials)
                {
                    if(!mat)
                        continue
                    if(mat.map)
                        mat.map.colorSpace = THREE.SRGBColorSpace
                    mat.side = THREE.FrontSide
                    mat.needsUpdate = true
                }
            }
        })

        // Align feet to group origin (y=0). Skinned AABB is imperfect — keep a small lift.
        this.model.updateMatrixWorld(true)
        const box = new THREE.Box3().setFromObject(this.model)
        if(Number.isFinite(box.min.y))
            this.model.position.y = -box.min.y + 0.08
        else
            this.model.position.y = 0.08

        this.group.add(this.model)
    }

    setAnimations()
    {
        const clips = this.gltf.animations || []
        this.mixer = new THREE.AnimationMixer(this.model)

        const findClip = (...names) =>
        {
            const lower = names.map((n) => n.toLowerCase())
            return clips.find((c) => lower.includes(c.name.toLowerCase()))
                || clips.find((c) => lower.some((n) => c.name.toLowerCase().includes(n)))
        }

        // Official Soldier.glb: Idle, Walk, Run
        const idleClip = findClip('Idle', 'idle') || clips[0]
        const walkClip = findClip('Walk', 'walk', 'Walking') || clips[1] || idleClip
        const runClip = findClip('Run', 'run', 'Running') || clips[2] || walkClip

        if(idleClip)
            this.actions.idle = this.mixer.clipAction(idleClip)
        if(walkClip)
            this.actions.walk = this.mixer.clipAction(walkClip)
        if(runClip)
            this.actions.run = this.mixer.clipAction(runClip)

        for(const key in this.actions)
        {
            const action = this.actions[key]
            action.enabled = true
            action.setEffectiveTimeScale(1)
            action.setEffectiveWeight(1)
            action.loop = THREE.LoopRepeat
        }

        if(this.actions.idle)
        {
            this.actions.idle.play()
            this.currentAction = this.actions.idle
        }
        else if(this.actions.walk)
        {
            this.actions.walk.play()
            this.currentAction = this.actions.walk
        }
    }

    playAction(name)
    {
        const next = this.actions[name]
        if(!next || next === this.currentAction)
            return

        next.reset()
        next.setEffectiveWeight(1)
        next.play()

        if(this.currentAction)
            this.currentAction.crossFadeTo(next, this.fadeDuration, false)
        else
            next.fadeIn(this.fadeDuration)

        this.currentAction = next
    }

    setVisible(visible)
    {
        this.visible = visible
        this.group.visible = visible

        if(visible && this.actions.idle)
        {
            for(const key in this.actions)
            {
                if(this.actions[key] !== this.actions.idle)
                    this.actions[key].stop()
            }
            this.actions.idle.reset().fadeIn(0.12).play()
            this.currentAction = this.actions.idle
        }
    }

    update()
    {
        if(!this.visible || this.game.player?.locomotion !== 'walk')
        {
            this.group.visible = false
            return
        }

        this.group.visible = true
        const walker = this.game.physicalWalker
        const speed = walker.xzSpeed || 0
        const delta = this.game.ticker.deltaScaled

        // Physics body origin ≈ feet. Model feet aligned to group y=0.
        // Extra lift so legs don't clip into the floor (skinned bound / ground tiles).
        const visualLift = 0.12
        this.group.position.set(
            walker.position.x,
            walker.position.y + visualLift,
            walker.position.z
        )
        this.group.rotation.y = walker.yRotation + this.yawOffset

        // Idle / walk / run (PhysicsWalker: walk 3.2, run 6.5)
        if(speed < 0.3)
            this.playAction('idle')
        else if(speed < 4.8)
            this.playAction('walk')
        else
            this.playAction('run')

        const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
        if(this.currentAction === this.actions.walk)
            this.currentAction.setEffectiveTimeScale(clamp(speed / 3.2, 0.75, 1.5))
        else if(this.currentAction === this.actions.run)
            this.currentAction.setEffectiveTimeScale(clamp(speed / 6.5, 0.85, 1.35))
        else if(this.currentAction)
            this.currentAction.setEffectiveTimeScale(1)

        if(this.mixer)
            this.mixer.update(delta)
    }
}
