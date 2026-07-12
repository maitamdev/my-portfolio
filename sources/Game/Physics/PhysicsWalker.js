import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'

/**
 * Simple capsule-like walk controller (Rapier dynamic body).
 * Movement is camera-relative so WASD matches the view (mouse orbit).
 */
export class PhysicsWalker
{
    constructor()
    {
        this.game = Game.getInstance()

        this.walkSpeed = 3.2
        this.runSpeed = 6.5
        this.turnSpeed = 14
        this.jumpImpulse = 4.5

        this.sideward = new THREE.Vector3(0, 0, 1)
        this.upward = new THREE.Vector3(0, 1, 0)
        this.forward = new THREE.Vector3(1, 0, 0)
        this.position = new THREE.Vector3()
        this.quaternion = new THREE.Quaternion()
        this.velocity = new THREE.Vector3()
        this.direction = new THREE.Vector3()
        this.speed = 0
        this.xzSpeed = 0
        this.forwardRatio = 1
        this.goingForward = true
        this.forwardSpeed = 0
        this.yRotation = 0

        // Match vehicle public shape so other systems stay safe
        this.wheels = {
            items: [
                { inContact: true, suspensionLength: 0, basePosition: new THREE.Vector3(), lastTouchTime: 0, contactPoint: null },
                { inContact: true, suspensionLength: 0, basePosition: new THREE.Vector3(), lastTouchTime: 0, contactPoint: null },
                { inContact: true, suspensionLength: 0, basePosition: new THREE.Vector3(), lastTouchTime: 0, contactPoint: null },
                { inContact: true, suspensionLength: 0, basePosition: new THREE.Vector3(), lastTouchTime: 0, contactPoint: null },
            ],
            inContactCount: 4,
            justTouchedCount: 0,
            settings: { radius: 0.3, frictionSlip: 1 },
        }
        this.steeringAmplitude = 0
        this.upsideDown = { active: false, ratio: 0 }
        this.stuck = { accumulate: () => {}, test: () => {} }
        this.flip = { jump: () => {}, test: () => {} }
        this.stop = { test: () => {} }

        this.enabled = false
        this.canJump = true
        this.jumpCooldown = 0

        this._moveDir = new THREE.Vector3()
        this._camForward = new THREE.Vector3()
        this._camRight = new THREE.Vector3()

        this.setBody()

        this.game.ticker.events.on('tick', () =>
        {
            this.updatePrePhysics()
        }, 2)

        this.game.ticker.events.on('tick', () =>
        {
            this.updatePostPhysics()
        }, 5)
    }

    setBody()
    {
        this.object = this.game.objects.add(null, {
            type: 'dynamic',
            position: new THREE.Vector3(0, 2, 0),
            friction: 0.8,
            linearDamping: 0.2,
            angularDamping: 4,
            canSleep: false,
            enabled: false,
            colliders: [
                {
                    shape: 'cylinder',
                    mass: 1.4,
                    // halfHeight, radius — taller to match ~1.85m visual
                    parameters: [ 0.7, 0.35 ],
                    position: { x: 0, y: 0.75, z: 0 },
                },
                {
                    shape: 'ball',
                    mass: 0.5,
                    parameters: [ 0.35 ],
                    position: { x: 0, y: 0.35, z: 0 },
                },
            ],
        })

        this.body = this.object.physical.body
        this.body.setEnabledRotations(false, true, false, true)
    }

    moveTo(position, rotation = 0)
    {
        // Body origin ≈ feet (ball bottom at local y=0).
        // Car chassis is ~1m high — convert to foot height when switching.
        let y = position.y
        if(y > 0.8 && y < 2.5)
            y = 0.4
        y = Math.max(0.35, y)

        const quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotation)
        this.body.setTranslation({ x: position.x, y, z: position.z }, true)
        this.body.setRotation(quaternion, true)
        this.body.setLinvel({ x: 0, y: 0, z: 0 }, true)
        this.body.setAngvel({ x: 0, y: 0, z: 0 }, true)

        this.position.set(position.x, y, position.z)
        this.quaternion.copy(quaternion)
        this.yRotation = rotation
        // Vehicle local +X forward after yaw θ
        this.forward.set(Math.cos(rotation), 0, -Math.sin(rotation))
    }

    activate()
    {
        this.enabled = true
        this.body.setLinvel({ x: 0, y: 0, z: 0 }, true)
        this.body.setAngvel({ x: 0, y: 0, z: 0 }, true)
        this.body.setEnabled(true)
    }

    deactivate()
    {
        this.enabled = false
        this.body.setLinvel({ x: 0, y: 0, z: 0 }, true)
        this.body.setAngvel({ x: 0, y: 0, z: 0 }, true)
        this.body.setEnabled(false)
    }

    /**
     * Camera look direction on XZ and right vector (from spherical.theta).
     * Three.js spherical: offset = (sinφ·sinθ, cosφ, sinφ·cosθ)
     * Camera looks toward focus ⇒ forward XZ = (-sinθ, 0, -cosθ)
     */
    getCameraAxes()
    {
        const theta = this.game.view?.spherical?.theta ?? 0

        // Screen "up" / into the scene from camera
        this._camForward.set(-Math.sin(theta), 0, -Math.cos(theta)).normalize()
        // Screen right
        this._camRight.set(Math.cos(theta), 0, -Math.sin(theta)).normalize()
    }

    updatePrePhysics()
    {
        if(!this.enabled || this.game.player?.locomotion !== 'walk')
            return

        if(this.game.player.state !== this.game.player.constructor.STATE_DEFAULT)
        {
            const linvel = this.body.linvel()
            this.body.setLinvel({ x: 0, y: linvel.y, z: 0 }, true)
            return
        }

        const player = this.game.player
        const delta = this.game.ticker.deltaScaled
        const linvel = this.body.linvel()

        this.getCameraAxes()

        // Camera-relative WASD:
        // accelerating: W(+1) / S(-1) → along camera forward
        // steering: left(+1) / right(-1) in Player — invert so A = left on screen
        //   Player: left → steering +1, right → steering -1
        //   We want: A (left) → -camRight, D (right) → +camRight
        //   ⇒ moveRight = -player.steering
        const moveForward = player.accelerating
        const moveRight = -player.steering

        this._moveDir
            .set(0, 0, 0)
            .addScaledVector(this._camForward, moveForward)
            .addScaledVector(this._camRight, moveRight)

        const hasInput = this._moveDir.lengthSq() > 0.0001

        if(hasInput)
        {
            this._moveDir.normalize()

            const speed = player.boosting ? this.runSpeed : this.walkSpeed
            this.body.setLinvel({
                x: this._moveDir.x * speed,
                y: linvel.y,
                z: this._moveDir.z * speed,
            }, true)

            // Face movement direction (yaw matching vehicle: forward = (cos θ, 0, -sin θ))
            // atan2(-z, x) for that convention
            const targetYaw = Math.atan2(-this._moveDir.z, this._moveDir.x)
            let deltaYaw = targetYaw - this.yRotation
            // wrap to [-π, π]
            deltaYaw = Math.atan2(Math.sin(deltaYaw), Math.cos(deltaYaw))
            this.yRotation += deltaYaw * Math.min(1, this.turnSpeed * delta)

            const facing = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.yRotation)
            this.body.setRotation(facing, true)
            this.forward.set(Math.cos(this.yRotation), 0, -Math.sin(this.yRotation))
        }
        else
        {
            // Stop horizontal slide; keep facing
            this.body.setLinvel({ x: 0, y: linvel.y, z: 0 }, true)
            const facing = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.yRotation)
            this.body.setRotation(facing, true)
        }

        // Jump
        this.jumpCooldown = Math.max(0, this.jumpCooldown - delta)
        const wantJump = this.game.inputs.actions.get('suspensions')?.active
        if(wantJump && this.jumpCooldown <= 0 && Math.abs(linvel.y) < 0.4)
        {
            this.body.applyImpulse({ x: 0, y: this.jumpImpulse, z: 0 }, true)
            this.jumpCooldown = 0.45
        }
    }

    updatePostPhysics()
    {
        if(!this.enabled)
            return

        const translation = this.body.translation()
        const newPosition = new THREE.Vector3(translation.x, translation.y, translation.z)
        this.velocity.copy(newPosition).sub(this.position)
        this.position.copy(newPosition)
        this.quaternion.copy(this.body.rotation())

        this.sideward.set(0, 0, 1).applyQuaternion(this.quaternion)
        this.upward.set(0, 1, 0).applyQuaternion(this.quaternion)
        this.forward.set(Math.cos(this.yRotation), 0, -Math.sin(this.yRotation))

        const invDelta = this.game.ticker.deltaScaled > 0 ? 1 / this.game.ticker.deltaScaled : 0
        this.speed = this.velocity.length() * invDelta
        this.xzSpeed = Math.hypot(this.velocity.x, this.velocity.z) * invDelta
        this.direction.copy(this.velocity)
        if(this.direction.lengthSq() > 1e-8)
            this.direction.normalize()
        this.forwardRatio = this.direction.dot(this.forward)
        this.goingForward = this.forwardRatio > 0.2
        this.forwardSpeed = this.xzSpeed * (this.goingForward ? 1 : -1)
    }
}
