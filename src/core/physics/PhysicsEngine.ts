import * as CANNON from 'cannon-es';
import { ContraptionPart, SignalWire, MarbleMaterialType } from './ContraptionModel';
import { Vector3D } from '../world/WorldModel';

export interface PhysicsCollisionEvent {
  partAId: string;
  partBId: string;
  impactVelocity: number;
  contactPoint: Vector3D;
  isTrigger: boolean;
}

export class PhysicsEngine {
  public world: CANNON.World;
  private bodies: Map<string, CANNON.Body> = new Map();
  private partMap: Map<string, ContraptionPart> = new Map();
  private initialPartStates: Map<string, { position: Vector3D; rotation: Vector3D }> = new Map();
  private wires: SignalWire[] = [];
  
  public onCollision?: (event: PhysicsCollisionEvent) => void;
  public onBellHit?: (bellId: string, marbleId: string) => void;
  public onSwitchTrigger?: (switchId: string, pressed: boolean) => void;
  public onPortalTeleport?: (sourcePortalId: string, targetPortalId: string, bodyId: string) => void;

  // Materials
  private defaultMaterial: CANNON.Material;
  private bouncyMaterial: CANNON.Material;
  private slickMaterial: CANNON.Material;

  constructor(gravity: Vector3D = { x: 0, y: -9.81, z: 0 }) {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(gravity.x, gravity.y, gravity.z),
    });
    this.world.allowSleep = true;

    this.defaultMaterial = new CANNON.Material('default');
    this.bouncyMaterial = new CANNON.Material('bouncy');
    this.slickMaterial = new CANNON.Material('slick');

    const bouncyContact = new CANNON.ContactMaterial(this.defaultMaterial, this.bouncyMaterial, {
      restitution: 0.85,
      friction: 0.1,
    });
    const slickContact = new CANNON.ContactMaterial(this.slickMaterial, this.defaultMaterial, {
      restitution: 0.3,
      friction: 0.02,
    });
    const defaultContact = new CANNON.ContactMaterial(this.defaultMaterial, this.defaultMaterial, {
      restitution: 0.4,
      friction: 0.3,
    });

    this.world.addContactMaterial(bouncyContact);
    this.world.addContactMaterial(slickContact);
    this.world.addContactMaterial(defaultContact);

    // Ground plane fallback
    const groundBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Plane(),
      material: this.defaultMaterial,
    });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    groundBody.position.set(0, 0, 0);
    this.world.addBody(groundBody);
  }

  public setGravity(g: Vector3D): void {
    this.world.gravity.set(g.x, g.y, g.z);
    // Wake up sleeping bodies so they respond to gravity shift
    this.bodies.forEach(b => b.wakeUp());
  }

  public setBounciness(multiplier: number): void {
    this.world.contactmaterials.forEach(cm => {
      cm.restitution = Math.min(1.0, 0.4 * multiplier);
    });
  }

  public registerPart(part: ContraptionPart): void {
    this.partMap.set(part.id, part);
    this.saveInitialState(part);

    // Remove existing body if replacing
    this.removeBody(part.id);

    let body: CANNON.Body;
    const pos = part.position;
    const rot = part.rotation;
    const sc = part.scale;

    switch (part.type) {
      case 'marble': {
        const radius = (part.marbleProperties?.radius || 0.4) * sc.x;
        const mass = part.marbleProperties?.mass || 1.0;
        const mat = part.marbleProperties?.material === 'rubber' ? this.bouncyMaterial : this.defaultMaterial;

        body = new CANNON.Body({
          mass: part.isStatic ? 0 : mass,
          shape: new CANNON.Sphere(radius),
          material: mat,
          linearDamping: 0.01,
          angularDamping: 0.05,
        });

        if (part.marbleProperties?.material === 'anti_grav') {
          // Anti-grav marbles float gently upward
          body.mass = 0.5;
        }
        break;
      }

      case 'ramp': {
        const halfExtents = new CANNON.Vec3(sc.x * 1.5, sc.y * 0.15, sc.z * 0.6);
        body = new CANNON.Body({
          type: CANNON.Body.STATIC,
          shape: new CANNON.Box(halfExtents),
          material: this.slickMaterial,
        });
        break;
      }

      case 'platform': {
        const halfExtents = new CANNON.Vec3(sc.x * 1.0, sc.y * 0.15, sc.z * 1.0);
        body = new CANNON.Body({
          type: CANNON.Body.STATIC,
          shape: new CANNON.Box(halfExtents),
          material: this.defaultMaterial,
        });
        break;
      }

      case 'spring': {
        const halfExtents = new CANNON.Vec3(sc.x * 0.8, sc.y * 0.2, sc.z * 0.8);
        body = new CANNON.Body({
          type: CANNON.Body.STATIC,
          shape: new CANNON.Box(halfExtents),
          material: this.bouncyMaterial,
        });
        break;
      }

      case 'domino': {
        const halfExtents = new CANNON.Vec3(sc.x * 0.1, sc.y * 0.75, sc.z * 0.35);
        body = new CANNON.Body({
          mass: 0.8,
          shape: new CANNON.Box(halfExtents),
          material: this.defaultMaterial,
        });
        break;
      }

      case 'switch_plate': {
        const halfExtents = new CANNON.Vec3(sc.x * 0.6, sc.y * 0.08, sc.z * 0.6);
        body = new CANNON.Body({
          type: CANNON.Body.STATIC,
          shape: new CANNON.Box(halfExtents),
          material: this.defaultMaterial,
        });
        break;
      }

      case 'target_bell': {
        const radius = sc.x * 0.5;
        body = new CANNON.Body({
          type: CANNON.Body.STATIC,
          shape: new CANNON.Sphere(radius),
          material: this.defaultMaterial,
        });
        break;
      }

      case 'launcher': {
        const halfExtents = new CANNON.Vec3(sc.x * 0.7, sc.y * 0.4, sc.z * 0.7);
        body = new CANNON.Body({
          type: CANNON.Body.STATIC,
          shape: new CANNON.Box(halfExtents),
          material: this.defaultMaterial,
        });
        break;
      }

      case 'spinner': {
        const halfExtents = new CANNON.Vec3(sc.x * 1.4, sc.y * 0.15, sc.z * 0.25);
        body = new CANNON.Body({
          type: CANNON.Body.KINEMATIC,
          shape: new CANNON.Box(halfExtents),
          material: this.defaultMaterial,
        });
        break;
      }

      default: {
        const halfExtents = new CANNON.Vec3(sc.x * 0.5, sc.y * 0.5, sc.z * 0.5);
        body = new CANNON.Body({
          type: part.isStatic ? CANNON.Body.STATIC : CANNON.Body.DYNAMIC,
          mass: part.isStatic ? 0 : 1.0,
          shape: new CANNON.Box(halfExtents),
          material: this.defaultMaterial,
        });
        break;
      }
    }

    body.position.set(pos.x, pos.y, pos.z);
    body.quaternion.setFromEuler(rot.x, rot.y, rot.z);

    // Collision listener
    body.addEventListener('collide', (e: { contact: CANNON.ContactEquation; body: CANNON.Body; target: CANNON.Body }) => {
      this.handleCollision(part.id, e);
    });

    this.world.addBody(body);
    this.bodies.set(part.id, body);
  }

  private handleCollision(partId: string, event: { contact: CANNON.ContactEquation; body: CANNON.Body; target: CANNON.Body }): void {
    const part = this.partMap.get(partId);
    if (!part) return;

    // Determine other colliding body
    let otherId: string | null = null;
    for (const [id, b] of this.bodies.entries()) {
      if (b === event.body && id !== partId) {
        otherId = id;
        break;
      }
    }

    const impactSpeed = event.contact.getImpactVelocityAlongNormal();

    // Trigger spring booster impulse
    if (part.type === 'spring') {
      const impulse = part.springProperties?.impulseStrength || 12.0;
      event.body.velocity.y = Math.max(event.body.velocity.y, impulse);
    }

    // Trigger pressure switch
    if (part.type === 'switch_plate' && Math.abs(impactSpeed) > 0.5) {
      if (part.switchProperties) {
        part.switchProperties.isPressed = true;
      }
      this.onSwitchTrigger?.(part.id, true);
      this.propagateSignal(part.id);
    }

    // Trigger target bell chime
    if (part.type === 'target_bell' && Math.abs(impactSpeed) > 0.3) {
      if (part.bellProperties) {
        part.bellProperties.hitCount++;
        part.bellProperties.lastHitTime = Date.now();
      }
      this.onBellHit?.(part.id, otherId || 'unknown');
    }

    // Trigger portal teleport
    if (part.type === 'portal_entry' && part.portalProperties?.linkedPortalId) {
      const exitPart = this.partMap.get(part.portalProperties.linkedPortalId);
      if (exitPart && otherId) {
        const travelingBody = this.bodies.get(otherId);
        if (travelingBody) {
          travelingBody.position.set(exitPart.position.x, exitPart.position.y + 0.8, exitPart.position.z);
          // Preserve momentum with slight exit boost
          travelingBody.velocity.y = Math.max(travelingBody.velocity.y, 4.0);
          this.onPortalTeleport?.(part.id, exitPart.id, otherId);
        }
      }
    }

    this.onCollision?.({
      partAId: partId,
      partBId: otherId || 'environment',
      impactVelocity: impactSpeed,
      contactPoint: {
        x: event.contact.rj.x,
        y: event.contact.rj.y,
        z: event.contact.rj.z,
      },
      isTrigger: part.type === 'switch_plate' || part.type === 'target_bell' || part.type === 'spring',
    });
  }

  public setWires(wires: SignalWire[]): void {
    this.wires = [...wires];
  }

  public propagateSignal(sourcePartId: string): void {
    const connectedWires = this.wires.filter(w => w.sourcePartId === sourcePartId);
    connectedWires.forEach(wire => {
      wire.active = true;
      wire.pulseTimeRemaining = 1.0;

      const targetPart = this.partMap.get(wire.targetPartId);
      if (targetPart) {
        // Activate receiver
        if (targetPart.type === 'launcher') {
          const body = this.bodies.get(targetPart.id);
          // Find any marble sitting near launcher and propel it!
          this.bodies.forEach((b, bId) => {
            const p = this.partMap.get(bId);
            if (p?.type === 'marble') {
              const dx = b.position.x - targetPart.position.x;
              const dy = b.position.y - targetPart.position.y;
              const dz = b.position.z - targetPart.position.z;
              const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
              if (dist < 2.0) {
                b.velocity.set(0, 14.0, -8.0);
              }
            }
          });
        }
      }
    });
  }

  public saveInitialState(part: ContraptionPart): void {
    this.initialPartStates.set(part.id, {
      position: { ...part.position },
      rotation: { ...part.rotation },
    });
  }

  public resetToConstructionState(): void {
    for (const [id, initial] of this.initialPartStates.entries()) {
      const body = this.bodies.get(id);
      if (body) {
        body.position.set(initial.position.x, initial.position.y, initial.position.z);
        body.quaternion.setFromEuler(initial.rotation.x, initial.rotation.y, initial.rotation.z);
        body.velocity.set(0, 0, 0);
        body.angularVelocity.set(0, 0, 0);
        body.wakeUp();
      }
    }
  }

  public removeBody(partId: string): void {
    const body = this.bodies.get(partId);
    if (body) {
      this.world.removeBody(body);
      this.bodies.delete(partId);
    }
    this.partMap.delete(partId);
  }

  public step(dt: number): void {
    // Kinematic updates (e.g. rotating spinners, fans)
    this.partMap.forEach((part, id) => {
      if (part.type === 'spinner') {
        const body = this.bodies.get(id);
        if (body) {
          const speed = part.spinnerProperties?.angularSpeed || 2.5;
          const euler = new CANNON.Vec3();
          body.quaternion.toEuler(euler);
          body.quaternion.setFromEuler(0, euler.y + speed * dt, 0);
        }
      }

      if (part.type === 'fan' && part.fanProperties?.active !== false) {
        // Apply wind force field in front of fan
        const strength = part.fanProperties?.windStrength || 15.0;
        const range = part.fanProperties?.windRange || 6.0;
        this.bodies.forEach(b => {
          if (b.type === CANNON.Body.DYNAMIC) {
            const dx = b.position.x - part.position.x;
            const dy = b.position.y - part.position.y;
            const dz = b.position.z - part.position.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (dist < range && dist > 0.1) {
              b.applyForce(new CANNON.Vec3(0, strength * 0.4, -strength), b.position);
            }
          }
        });
      }

      if (part.type === 'marble' && part.marbleProperties?.material === 'anti_grav') {
        const body = this.bodies.get(id);
        if (body) {
          // Counteract gravity with gentle upwards lift
          body.applyForce(new CANNON.Vec3(0, 7.5, 0), body.position);
        }
      }
    });

    // Advance physics world with fixed 1/60s substeps
    this.world.step(1 / 60, dt, 3);

    // Sync body positions back to parts
    this.bodies.forEach((body, id) => {
      const part = this.partMap.get(id);
      if (part && !part.isStatic) {
        part.position = { x: body.position.x, y: body.position.y, z: body.position.z };
        const euler = new CANNON.Vec3();
        body.quaternion.toEuler(euler);
        part.rotation = { x: euler.x, y: euler.y, z: euler.z };
      }
    });
  }

  public getPartTransform(id: string): { position: Vector3D; rotation: Vector3D } | null {
    const body = this.bodies.get(id);
    if (!body) return null;
    const euler = new CANNON.Vec3();
    body.quaternion.toEuler(euler);
    return {
      position: { x: body.position.x, y: body.position.y, z: body.position.z },
      rotation: { x: euler.x, y: euler.y, z: euler.z },
    };
  }
}
