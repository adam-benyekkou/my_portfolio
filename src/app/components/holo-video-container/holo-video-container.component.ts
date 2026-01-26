import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
  Input,
  signal,
  effect,
  HostListener,
  NgZone,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

@Component({
  selector: 'app-holo-video-container',
  imports: [CommonModule],
  templateUrl: './holo-video-container.component.html',
  styleUrl: './holo-video-container.component.css',
})
export class HoloVideoContainerComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() videoSrc?: string;
  @Input() containerClasses = 'w-full h-96';

  isLoading = signal(false);

  // Three.js objects
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private points!: THREE.Points;
  private geometry!: THREE.BufferGeometry;
  private material!: THREE.PointsMaterial;
  private glowLayers: {
    points: THREE.Points;
    geometry: THREE.BufferGeometry;
  }[] = [];

  private animationId = 0;
  private video!: HTMLVideoElement;
  private canvas2D!: HTMLCanvasElement;
  private ctx2D!: CanvasRenderingContext2D;

  readonly GRID_WIDTH = 320;
  readonly GRID_HEIGHT = 180;
  readonly POINTS_COUNT = this.GRID_WIDTH * this.GRID_HEIGHT;

  // Enhanced mouse and effects
  private mouseX = 0;
  private mouseY = 0;
  private isMouseOverCanvas = false;
  private glitchTime = 0;
  private glitchIntensity = 0;
  private resizeObserver!: ResizeObserver;

  // Enhanced scatter properties
  private scatterIntensityMap = new Float32Array(this.POINTS_COUNT);
  private scatterDecayMap = new Float32Array(this.POINTS_COUNT);
  private readonly MAX_SCATTER_DISTANCE = 600;
  private readonly SCATTER_STRENGTH = 45;
  private readonly GLOW_INTENSITY = 4.0;

  // Optimization: Reuse arrays
  private tempPositions = new Float32Array(this.POINTS_COUNT * 3);
  private tempColors = new Float32Array(this.POINTS_COUNT * 3);

  // MEMORY LEAK FIX: Add pattern animation cleanup
  private patternAnimationId = 0;
  private isDestroyed = false;
  private readonly ngZone = inject(NgZone);

  constructor() {
    effect(() => {
      if (this.material) {
        this.material.size = 6.0;
      }
    });
  }

  async ngOnInit(): Promise<void> {
    this.initThreeJS();
    this.createPointCloud();
    await this.setupVideo();
    this.setupEventListeners();
    this.setupResizeObserver();

    this.ngZone.runOutsideAngular(() => {
      this.animate();
    });

    this.onWindowResize();

    if (this.videoSrc) {
      await this.loadVideoFromSrc(this.videoSrc);
    }
  }

  ngOnDestroy(): void {
    // MEMORY LEAK FIX: Comprehensive cleanup
    this.cleanup();
  }

  // MEMORY LEAK FIX: Proper cleanup method
  private cleanup(): void {
    this.isDestroyed = true;

    // Cancel all animations
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = 0;
    }

    if (this.patternAnimationId) {
      cancelAnimationFrame(this.patternAnimationId);
      this.patternAnimationId = 0;
    }

    // Disconnect resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    // Stop and cleanup video
    if (this.video) {
      this.video.pause();
      if (this.video.srcObject) {
        const stream = this.video.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      this.video.src = '';
      this.video.srcObject = null;
      this.video.load();
    }

    // Cleanup Three.js resources
    if (this.geometry) {
      this.geometry.dispose();
    }
    if (this.material) {
      this.material.dispose();
    }

    this.glowLayers.forEach((layer) => {
      if (layer.geometry) {
        layer.geometry.dispose();
      }
      if (layer.points.material) {
        (layer.points.material as THREE.Material).dispose();
      }
      if (this.scene) {
        this.scene.remove(layer.points);
      }
    });
    this.glowLayers = [];

    if (this.points && this.scene) {
      this.scene.remove(this.points);
    }

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
    }
  }

  private initThreeJS(): void {
    const canvas = this.canvasRef.nativeElement;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0d14);

    this.camera = new THREE.PerspectiveCamera(40, 1, 1, 10000);
    this.camera.position.set(0, 0, 800);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  private setupResizeObserver(): void {
    const canvas = this.canvasRef.nativeElement;

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          this.handleResize(width, height);
        }
      }
    });

    this.resizeObserver.observe(canvas);
  }

  private handleResize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);

    const fov = this.camera.fov * (Math.PI / 180);
    const gridHeight = this.GRID_HEIGHT * 12;
    const gridWidth = this.GRID_WIDTH * 12;

    const vFov = fov;
    const hFov = 2 * Math.atan(Math.tan(fov / 2) * this.camera.aspect);

    const distanceHeight = gridHeight / 2 / Math.tan(vFov / 2);
    const distanceWidth = gridWidth / 2 / Math.tan(hFov / 2);

    const isMobile = window.innerWidth <= 768;
    const distanceFactor = isMobile ? 1.4 : 0.95;
    this.camera.position.z = Math.max(distanceHeight, distanceWidth) * distanceFactor;
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();

    if (rect.width > 0 && rect.height > 0) {
      this.handleResize(rect.width, rect.height);
    }
  }

  private createPointCloud(): void {
    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.POINTS_COUNT * 3);
    const colors = new Float32Array(this.POINTS_COUNT * 3);
    const originalPositions = new Float32Array(this.POINTS_COUNT * 3);

    let index = 0;
    for (let y = 0; y < this.GRID_HEIGHT; y++) {
      for (let x = 0; x < this.GRID_WIDTH; x++) {
        const posX = (x - this.GRID_WIDTH / 2) * 12;
        const posY = -(y - this.GRID_HEIGHT / 2) * 12;

        positions[index * 3] = posX;
        positions[index * 3 + 1] = posY;
        positions[index * 3 + 2] = 0;

        originalPositions[index * 3] = posX;
        originalPositions[index * 3 + 1] = posY;
        originalPositions[index * 3 + 2] = 0;

        colors[index * 3] = colors[index * 3 + 1] = colors[index * 3 + 2] = 0.8;

        // Initialize scatter maps
        this.scatterIntensityMap[index] = 0;
        this.scatterDecayMap[index] = 0;

        index++;
      }
    }

    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3),
    );
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.geometry.setAttribute(
      'originalPosition',
      new THREE.BufferAttribute(originalPositions, 3),
    );

    this.material = new THREE.PointsMaterial({
      size: 6.0,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      alphaTest: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.points);
    this.createGlowLayers();
  }

  private createGlowLayers(): void {
    // Enhanced glow layers for stronger effect
    for (let layer = 1; layer <= 3; layer++) {
      const glowGeometry = this.geometry.clone();
      const glowMaterial = new THREE.PointsMaterial({
        size: 6.0 * (1 + layer * 0.6), // Larger glow sizes
        vertexColors: true,
        transparent: true,
        opacity: 0.4 / layer, // Increased opacity
        alphaTest: 0.1,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });

      const glowPoints = new THREE.Points(glowGeometry, glowMaterial);
      this.scene.add(glowPoints);
      this.glowLayers.push({ points: glowPoints, geometry: glowGeometry });
    }
  }

  private async setupVideo(): Promise<void> {
    this.video = document.createElement('video');
    this.video.width = this.GRID_WIDTH;
    this.video.height = this.GRID_HEIGHT;
    this.video.autoplay = true;
    this.video.muted = true;
    this.video.loop = true;
    this.video.preload = 'auto';
    this.video.setAttribute('playsinline', 'true');
    this.video.setAttribute('webkit-playsinline', 'true');

    this.canvas2D = document.createElement('canvas');
    this.canvas2D.width = this.GRID_WIDTH;
    this.canvas2D.height = this.GRID_HEIGHT;
    this.ctx2D = this.canvas2D.getContext('2d')!;

    // Only create pattern if no source is provided to avoid mobile captureStream issues
    if (!this.videoSrc) {
      await this.createAnimatedPattern();
    }
  }

  private async createAnimatedPattern(): Promise<void> {
    const canvas = document.createElement('canvas');
    canvas.width = this.GRID_WIDTH;
    canvas.height = this.GRID_HEIGHT;
    const ctx = canvas.getContext('2d')!;

    let time = 0;

    // MEMORY LEAK FIX: Store animation ID and check for component destruction
    const animate = () => {
      // MEMORY LEAK FIX: Stop animation if component is destroyed
      if (this.isDestroyed) {
        return;
      }

      const imageData = ctx.createImageData(this.GRID_WIDTH, this.GRID_HEIGHT);
      const data = imageData.data;

      for (let y = 0; y < this.GRID_HEIGHT; y++) {
        for (let x = 0; x < this.GRID_WIDTH; x++) {
          const index = (y * this.GRID_WIDTH + x) * 4;
          const centerX = this.GRID_WIDTH / 2;
          const centerY = this.GRID_HEIGHT / 2;
          const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
          const wave = Math.sin(distance * 0.08 + time * 0.04) * 0.5 + 0.5;
          const noise =
            Math.sin(x * 0.05 + time * 0.015) *
            Math.cos(y * 0.05 + time * 0.02);
          const intensity = Math.max(
            0,
            Math.min(255, (wave + noise * 0.4) * 255),
          );

          data[index] = intensity;
          data[index + 1] = intensity * 0.85;
          data[index + 2] = intensity * 0.7;
          data[index + 3] = 255;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      time++;

      // MEMORY LEAK FIX: Store the animation ID for proper cleanup
      if (!this.isDestroyed) {
        this.patternAnimationId = requestAnimationFrame(animate);
      }
    };

    this.ngZone.runOutsideAngular(() => {
      animate();
    });

    try {
      const stream = canvas.captureStream(30);
      this.video.srcObject = stream;
      await this.video.play();
    } catch (error) {
      console.warn('Pattern video setup failed:', error);
    }
  }

  private updatePointCloud(): void {
    if (!this.video.videoWidth || !this.video.videoHeight) return;

    // Enhanced glitch system
    this.glitchTime++;
    if (Math.random() < 0.008) {
      this.glitchIntensity = Math.random() * 1.2 + 0.6;
      setTimeout(() => (this.glitchIntensity = 0), Math.random() * 500 + 150);
    }

    this.ctx2D.drawImage(this.video, 0, 0, this.GRID_WIDTH, this.GRID_HEIGHT);
    const imageData = this.ctx2D.getImageData(
      0,
      0,
      this.GRID_WIDTH,
      this.GRID_HEIGHT,
    );
    const data = imageData.data;

    const positions = this.geometry.attributes['position']
      .array as Float32Array;
    const colors = this.geometry.attributes['color'].array as Float32Array;
    const originalPositions = this.geometry.attributes['originalPosition']
      .array as Float32Array;

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const mouseWorldX =
      ((this.mouseX / rect.width) * 2 - 1) * (this.GRID_WIDTH * 6);
    const mouseWorldY =
      -((this.mouseY / rect.height) * 2 - 1) * (this.GRID_HEIGHT * 6);

    const isGlitching = this.glitchIntensity > 0;

    // MEMORY LEAK FIX: Add periodic cleanup of scatter arrays
    if (this.glitchTime % 300 === 0) {
      // Every 5 seconds at 60fps
      for (let i = 0; i < this.POINTS_COUNT; i++) {
        if (this.scatterDecayMap[i] < 0.01) {
          this.scatterDecayMap[i] = 0;
          this.scatterIntensityMap[i] = 0;
        }
      }
    }

    // Update scatter decay for all points
    for (let i = 0; i < this.POINTS_COUNT; i++) {
      if (this.scatterDecayMap[i] > 0) {
        this.scatterDecayMap[i] *= 0.92; // Slower decay for longer effect
        if (this.scatterDecayMap[i] < 0.01) {
          this.scatterDecayMap[i] = 0;
          this.scatterIntensityMap[i] = 0;
        }
      }
    }

    let index = 0;
    for (let y = 0; y < this.GRID_HEIGHT; y++) {
      for (let x = 0; x < this.GRID_WIDTH; x++) {
        const pixelIndex = (y * this.GRID_WIDTH + x) * 4;
        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];
        const brightness = (r + g + b) / 3;

        if (brightness <= 40) {
          positions[index * 3] = positions[index * 3 + 1] = 0;
          positions[index * 3 + 2] = -10000;
          colors[index * 3] = colors[index * 3 + 1] = colors[index * 3 + 2] = 0;
          index++;
          continue;
        }

        let depth = brightness / 255;
        depth = Math.pow(depth, 2.2);
        const baseZ = depth * 400 - 200;

        const originalX = originalPositions[index * 3];
        const originalY = originalPositions[index * 3 + 1];

        const distanceToMouse = Math.sqrt(
          Math.pow(originalX - mouseWorldX, 2) +
          Math.pow(originalY - mouseWorldY, 2),
        );

        // ENHANCED: Much stronger scatter effect with persistent intensity
        let scatterX = 0,
          scatterY = 0,
          scatterZ = 0;
        let currentScatterIntensity = this.scatterIntensityMap[index];

        if (
          this.isMouseOverCanvas &&
          distanceToMouse < this.MAX_SCATTER_DISTANCE
        ) {
          // Calculate scatter factor with explosive falloff
          const scatterFactor = Math.pow(
            1 - distanceToMouse / this.MAX_SCATTER_DISTANCE,
            1.5,
          );
          const newScatterIntensity = scatterFactor * this.SCATTER_STRENGTH;

          // Update scatter intensity (with momentum for explosive transitions)
          if (newScatterIntensity > currentScatterIntensity) {
            this.scatterIntensityMap[index] = newScatterIntensity;
            this.scatterDecayMap[index] = 1.0; // Full decay strength
            currentScatterIntensity = newScatterIntensity;
          }

          const deltaX = originalX - mouseWorldX;
          const deltaY = originalY - mouseWorldY;
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

          if (distance > 0) {
            // Explosive scatter with dramatic randomness
            const randomFactor = 0.6 + Math.random() * 0.8; // Increased randomness
            const explosionMultiplier = 1.5 + Math.random() * 0.5; // Extra explosion force

            scatterX =
              (deltaX / distance) *
              currentScatterIntensity *
              randomFactor *
              explosionMultiplier;
            scatterY =
              (deltaY / distance) *
              currentScatterIntensity *
              randomFactor *
              explosionMultiplier;
            scatterZ = currentScatterIntensity * 0.6 * randomFactor;

            // Add chaotic perpendicular scatter for spiral explosion
            const perpX = -deltaY / distance;
            const perpY = deltaX / distance;
            const perpScatter =
              (Math.random() - 0.5) * currentScatterIntensity * 0.5;
            scatterX += perpX * perpScatter;
            scatterY += perpY * perpScatter;
          }
        } else if (currentScatterIntensity > 0) {
          // Apply decaying scatter effect
          const decayFactor = this.scatterDecayMap[index];
          const deltaX = originalX - mouseWorldX;
          const deltaY = originalY - mouseWorldY;
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

          if (distance > 0) {
            scatterX =
              (deltaX / distance) * currentScatterIntensity * decayFactor;
            scatterY =
              (deltaY / distance) * currentScatterIntensity * decayFactor;
            scatterZ = currentScatterIntensity * 0.4 * decayFactor;
          }
        }

        // Enhanced glitch effect
        let glitchX = 0,
          glitchY = 0,
          glitchZ = 0;
        if (isGlitching) {
          glitchX = (Math.random() - 0.5) * this.glitchIntensity * 35;
          glitchY = (Math.random() - 0.5) * this.glitchIntensity * 35;
          glitchZ = (Math.random() - 0.5) * this.glitchIntensity * 30;
        }

        positions[index * 3] = originalX + scatterX + glitchX;
        positions[index * 3 + 1] = originalY + scatterY + glitchY;
        positions[index * 3 + 2] = baseZ + scatterZ + glitchZ;

        // Apply enhanced colors with strong white glow for scattered points
        this.applyEnhancedHolographicColors(
          colors,
          index,
          brightness,
          distanceToMouse,
          currentScatterIntensity,
          isGlitching,
        );

        index++;
      }
    }

    this.geometry.attributes['position'].needsUpdate = true;
    this.geometry.attributes['color'].needsUpdate = true;
    this.updateGlowLayers();
  }

  private applyEnhancedHolographicColors(
    colors: Float32Array,
    index: number,
    brightness: number,
    distanceToMouse: number,
    scatterIntensity: number,
    isGlitching: boolean,
  ): void {
    let finalColor = [0.5, 0.5, 0.5];

    // Base color mapping
    if (brightness > 220) finalColor = [0.95, 0.95, 0.95];
    else if (brightness > 180) finalColor = [0.85, 0.85, 0.85];
    else if (brightness > 140) finalColor = [0.7, 0.7, 0.7];
    else if (brightness > 100) finalColor = [0.55, 0.55, 0.55];
    else if (brightness > 60) finalColor = [0.4, 0.4, 0.4];
    else finalColor = [0.25, 0.25, 0.25];

    // Subtle color variations
    const variation = (index % 5) / 25;
    finalColor[0] += variation * 0.08;
    finalColor[1] += variation * 0.04;
    finalColor[2] += variation * 0.12;

    // DRAMATIC WHITE GLOW for scattered points
    if (scatterIntensity > 0) {
      const glowFactor =
        (scatterIntensity / this.SCATTER_STRENGTH) * this.GLOW_INTENSITY;

      // Progressive white explosion effect
      if (glowFactor > 2.0) {
        // Complete white explosion for heavily scattered points
        finalColor = [1.0, 1.0, 1.0];
      } else if (glowFactor > 1.0) {
        // Intense white glow
        finalColor[0] = Math.min(1.0, finalColor[0] + glowFactor * 0.8);
        finalColor[1] = Math.min(1.0, finalColor[1] + glowFactor * 0.9);
        finalColor[2] = Math.min(1.0, finalColor[2] + glowFactor * 1.0);
      } else {
        // Moderate white glow with blue tint
        finalColor[0] = Math.min(1.0, finalColor[0] + glowFactor * 0.6);
        finalColor[1] = Math.min(1.0, finalColor[1] + glowFactor * 0.8);
        finalColor[2] = Math.min(1.0, finalColor[2] + glowFactor * 1.0);
      }

      // Add extra white flash for very scattered points
      if (scatterIntensity > this.SCATTER_STRENGTH * 0.7) {
        finalColor[0] = finalColor[1] = finalColor[2] = 1.0;
      }
    }

    // Enhanced glitch effect with more white flashing
    if (isGlitching) {
      const glitchWhiteness = this.glitchIntensity * 0.8;
      finalColor[0] = Math.min(1.0, finalColor[0] + glitchWhiteness);
      finalColor[1] = Math.min(1.0, finalColor[1] + glitchWhiteness);
      finalColor[2] = Math.min(1.0, finalColor[2] + glitchWhiteness);

      // More frequent pure white flashes during glitch
      if (Math.random() < 0.25) {
        finalColor[0] = finalColor[1] = finalColor[2] = 1.0;
      }
    }

    colors[index * 3] = finalColor[0];
    colors[index * 3 + 1] = finalColor[1];
    colors[index * 3 + 2] = finalColor[2];
  }

  private updateGlowLayers(): void {
    const mainPositions = this.geometry.attributes['position']
      .array as Float32Array;
    const mainColors = this.geometry.attributes['color'].array as Float32Array;

    this.glowLayers.forEach((layer, layerIndex) => {
      const layerPositions = layer.geometry.attributes['position']
        .array as Float32Array;
      const layerColors = layer.geometry.attributes['color']
        .array as Float32Array;

      // Copy positions with slight offset for depth
      for (let i = 0; i < mainPositions.length; i += 3) {
        layerPositions[i] = mainPositions[i];
        layerPositions[i + 1] = mainPositions[i + 1];
        layerPositions[i + 2] = mainPositions[i + 2] - (layerIndex + 1) * 4; // Increased offset
      }

      // Enhanced glow colors with stronger intensity for white particles
      const glowIntensity = 0.9 / (layerIndex + 1); // Increased from 0.7
      for (let i = 0; i < mainColors.length; i += 3) {
        // Amplify white/bright colors dramatically in glow layers
        const brightnessFactor =
          (mainColors[i] + mainColors[i + 1] + mainColors[i + 2]) / 3;
        const isWhite = brightnessFactor > 0.9;
        const glowBoost = isWhite ? 2.5 : brightnessFactor > 0.8 ? 1.8 : 1.0;

        layerColors[i] = mainColors[i] * glowIntensity * glowBoost;
        layerColors[i + 1] = mainColors[i + 1] * glowIntensity * glowBoost;
        layerColors[i + 2] = mainColors[i + 2] * glowIntensity * glowBoost;
      }

      layer.geometry.attributes['position'].needsUpdate = true;
      layer.geometry.attributes['color'].needsUpdate = true;
    });
  }

  private setupEventListeners(): void {
    const canvas = this.canvasRef.nativeElement;

    canvas.addEventListener('mousemove', (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      this.mouseX = event.clientX - rect.left;
      this.mouseY = event.clientY - rect.top;
    });

    canvas.addEventListener(
      'mouseenter',
      () => (this.isMouseOverCanvas = true),
    );
    canvas.addEventListener('mouseleave', () => {
      this.isMouseOverCanvas = false;
      // Don't reset scatter immediately - let it decay naturally
    });
  }

  private animate(): void {
    // MEMORY LEAK FIX: Check if component is destroyed
    if (this.isDestroyed) return;

    this.animationId = requestAnimationFrame(() => this.animate());
    this.updatePointCloud();
    this.renderer.render(this.scene, this.camera);
  }

  private async loadVideoFromSrc(src: string): Promise<void> {
    try {
      // MEMORY LEAK FIX: Properly stop existing stream before loading new one
      if (this.video.srcObject) {
        const stream = this.video.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        this.video.srcObject = null;
      }

      this.video.src = src;
      this.video.loop = true; // Ensure loop is set after changing source
      this.video.muted = true; // Also ensure muted is maintained
      this.video.autoplay = true; // Ensure autoplay is maintained
      this.video.load();
      await this.video.play();
    } catch (error) {
      console.warn('Video load failed:', error);
    }
  }

  get isLoadingValue(): boolean {
    return this.isLoading();
  }
}
