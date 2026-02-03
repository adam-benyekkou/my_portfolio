import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
  inject,
  NgZone,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../shared/services/loading.service';
import type {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Mesh,
  Material,
  Object3D,
} from 'three';

@Component({
  selector: 'app-three-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './three-loader.component.html',
  styleUrl: './three-loader.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThreeLoaderComponent implements OnInit, OnDestroy {
  @ViewChild('loaderCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly loadingService = inject(LoadingService);
  private readonly ngZone = inject(NgZone);
  isLoading = this.loadingService.isLoading;

  private scene!: Scene;
  private camera!: PerspectiveCamera;
  private renderer!: WebGLRenderer;
  private diamond!: Mesh;
  private animationId = 0;
  private THREE!: typeof import('three'); // Hold reference to the module

  async ngOnInit(): Promise<void> {
    // Lazy load Three.js
    this.THREE = await import('three');
    this.initThree();
    this.createDiamond();
    this.animate();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private initThree(): void {
    const canvas = this.canvasRef.nativeElement;
    this.scene = new this.THREE.Scene();

    // Transparent background for overlay
    this.camera = new this.THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    this.camera.position.z = 5;

    this.renderer = new this.THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    this.renderer.setSize(150, 150);
  }

  private createDiamond(): void {
    // NieR-style octahedron (diamond)
    const geometry = new this.THREE.OctahedronGeometry(1, 0);

    // Wireframe material with NieR accent color
    const material = new this.THREE.MeshBasicMaterial({
      color: 0x5a5a50,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    });

    this.diamond = new this.THREE.Mesh(geometry, material);
    this.scene.add(this.diamond);

    // Inner solid core (subtle)
    const coreGeometry = new this.THREE.OctahedronGeometry(0.5, 0);
    const coreMaterial = new this.THREE.MeshBasicMaterial({
      color: 0x5a5a50,
      transparent: true,
      opacity: 0.2,
    });
    const core = new this.THREE.Mesh(coreGeometry, coreMaterial);
    this.diamond.add(core);
  }

  private animate(): void {
    this.ngZone.runOutsideAngular(() => {
      const loop = () => {
        if (this.animationId === -1) return;

        this.animationId = requestAnimationFrame(loop);

        if (this.diamond && this.renderer && this.scene && this.camera) {
          this.diamond.rotation.y += 0.02;
          this.diamond.rotation.x += 0.01;

          // Subtle scaling pulse
          const pulse = 1 + Math.sin(Date.now() * 0.005) * 0.1;
          this.diamond.scale.set(pulse, pulse, pulse);

          this.renderer.render(this.scene, this.camera);
        }
      };
      loop();
    });
  }

  private cleanup(): void {
    this.animationId = -1;
    // Check if Three.js was loaded before cleaning up
    if (this.THREE && this.diamond) {
      if (this.diamond.geometry) this.diamond.geometry.dispose();

      if (this.diamond.material) {
        (this.diamond.material as Material).dispose();
      }

      if (this.diamond.children) {
        this.diamond.children.forEach((child: Object3D) => {
          if (child instanceof this.THREE.Mesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) (child.material as Material).dispose();
          }
        });
      }
    }

    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
