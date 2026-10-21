import * as THREE from 'three';

export interface CameraPreset {
  azimuth: number; // horizontal angle
  elevation: number; // vertical angle
  distance: number;
  target: THREE.Vector3;
}

export class CameraController {
  public camera: THREE.PerspectiveCamera;
  public domElement: HTMLElement;

  public target: THREE.Vector3 = new THREE.Vector3(0, 2, 0);
  public azimuth: number = Math.PI / 4; // 45 deg
  public elevation: number = Math.PI / 6; // 30 deg
  public distance: number = 26;

  private targetAzimuth: number = Math.PI / 4;
  private targetElevation: number = Math.PI / 6;
  private targetDistance: number = 26;
  private targetPos: THREE.Vector3 = new THREE.Vector3(0, 2, 0);

  private isDragging: boolean = false;
  private isPanning: boolean = false;
  private prevMouseX: number = 0;
  private prevMouseY: number = 0;

  public followingTarget: THREE.Vector3 | null = null;

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.bindEvents();
    this.updateCameraImmediate();
  }

  private bindEvents(): void {
    this.domElement.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    this.domElement.addEventListener('wheel', this.onWheel, { passive: false });
    this.domElement.addEventListener('contextmenu', e => e.preventDefault());
  }

  public dispose(): void {
    this.domElement.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    this.domElement.removeEventListener('wheel', this.onWheel);
  }

  private onMouseDown = (e: MouseEvent) => {
    this.prevMouseX = e.clientX;
    this.prevMouseY = e.clientY;
    if (e.button === 0 && !e.shiftKey) {
      this.isDragging = true;
    } else if (e.button === 2 || (e.button === 0 && e.shiftKey) || e.button === 1) {
      this.isPanning = true;
    }
  };

  private onMouseMove = (e: MouseEvent) => {
    if (!this.isDragging && !this.isPanning) return;

    const dx = e.clientX - this.prevMouseX;
    const dy = e.clientY - this.prevMouseY;
    this.prevMouseX = e.clientX;
    this.prevMouseY = e.clientY;

    if (this.isDragging) {
      this.targetAzimuth -= dx * 0.006;
      this.targetElevation = Math.max(0.08, Math.min(Math.PI / 2 - 0.05, this.targetElevation + dy * 0.006));
    } else if (this.isPanning) {
      const panSpeed = this.distance * 0.0015;
      const forward = new THREE.Vector3();
      this.camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();

      const right = new THREE.Vector3();
      right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

      this.targetPos.addScaledVector(right, -dx * panSpeed);
      this.targetPos.addScaledVector(forward, dy * panSpeed);
      this.followingTarget = null; // Break follow lock on manual pan
    }
  };

  private onMouseUp = () => {
    this.isDragging = false;
    this.isPanning = false;
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY * 0.02;
    this.targetDistance = Math.max(6, Math.min(50, this.targetDistance + zoomFactor));
  };

  public fitToWorld(): void {
    this.targetAzimuth = Math.PI / 4;
    this.targetElevation = Math.PI / 6;
    this.targetDistance = 26;
    this.targetPos.set(0, 2, 0);
    this.followingTarget = null;
  }

  public setTopDown(): void {
    this.targetElevation = Math.PI / 2 - 0.08;
    this.targetDistance = 28;
    this.targetPos.set(0, 0, 0);
    this.followingTarget = null;
  }

  public setIsometric(): void {
    this.targetAzimuth = Math.PI / 4;
    this.targetElevation = Math.PI / 5;
    this.targetDistance = 24;
    this.followingTarget = null;
  }

  public follow(pos: THREE.Vector3): void {
    this.followingTarget = pos;
  }

  public update(dt: number): void {
    if (this.followingTarget) {
      this.targetPos.lerp(this.followingTarget, Math.min(1.0, 5.0 * dt));
    }

    const damp = Math.min(1.0, 10.0 * dt);
    this.azimuth += (this.targetAzimuth - this.azimuth) * damp;
    this.elevation += (this.targetElevation - this.elevation) * damp;
    this.distance += (this.targetDistance - this.distance) * damp;
    this.target.lerp(this.targetPos, damp);

    this.updateCameraImmediate();
  }

  private updateCameraImmediate(): void {
    const x = this.target.x + this.distance * Math.cos(this.elevation) * Math.sin(this.azimuth);
    const y = this.target.y + this.distance * Math.sin(this.elevation);
    const z = this.target.z + this.distance * Math.cos(this.elevation) * Math.cos(this.azimuth);

    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.target);
  }
}
