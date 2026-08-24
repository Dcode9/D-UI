import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export type ModelType = 'swift' | 'apple' | 'dverse' | 'sphere' | 'torus';

interface Metallic3dSceneProps {
  modelType?: ModelType;
  roughness?: number;
  metalness?: number;
  warmGlowIntensity?: number;
  coolGlowIntensity?: number;
  cursorLightIntensity?: number;
}

export const Metallic3dScene: React.FC<Metallic3dSceneProps> = ({
  modelType = 'swift',
  roughness = 0.18,
  metalness = 0.95,
  warmGlowIntensity = 1.0,
  coolGlowIntensity = 1.0,
  cursorLightIntensity = 1.0,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0.5 });
  const [currentModel, setCurrentModel] = useState<ModelType>(modelType);

  useEffect(() => {
    setCurrentModel(modelType);
  }, [modelType]);

  // Track cursor coordinates normalized to [-1, 1]
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current = { x, y };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. SCENE & CAMERA
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 7.5);

    // 2. RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 3. PHYSICAL METALLIC MATERIAL
    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x18181f),
      metalness: metalness,
      roughness: roughness,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      reflectivity: 1.0,
      ior: 2.4,
    });

    // 4. GENERATE 3D MESH BASED ON SELECTED MODEL
    let meshGroup = new THREE.Group();

    function buildModel(type: ModelType): THREE.Group {
      const group = new THREE.Group();

      if (type === 'swift') {
        // Parametric Swift Bird 2D Shape with Bevel Extrusion
        const shape = new THREE.Shape();
        
        // Head and beak
        shape.moveTo(1.8, -0.9);
        shape.bezierCurveTo(1.6, -0.6, 1.2, -0.2, 0.8, 0.1);
        
        // Upper wing sweep
        shape.bezierCurveTo(0.9, 0.8, 1.3, 1.8, 0.6, 2.6);
        shape.bezierCurveTo(0.2, 1.8, -0.4, 1.1, -0.8, 0.8);
        
        // Middle feather crest
        shape.bezierCurveTo(-0.7, 1.6, -0.4, 2.2, -0.8, 2.8);
        shape.bezierCurveTo(-1.1, 2.0, -1.5, 1.3, -1.7, 0.7);
        
        // Long outer wing tail
        shape.bezierCurveTo(-1.8, 1.5, -1.6, 2.2, -2.1, 2.7);
        shape.bezierCurveTo(-2.1, 1.6, -1.9, 0.7, -1.7, 0.0);
        
        // Lower body curve
        shape.bezierCurveTo(-2.5, -0.8, -2.0, -1.6, -1.1, -1.8);
        shape.bezierCurveTo(-0.2, -2.0, 0.8, -1.6, 1.8, -0.9);

        const extrudeSettings = {
          steps: 2,
          depth: 0.28,
          bevelEnabled: true,
          bevelThickness: 0.14,
          bevelSize: 0.12,
          bevelOffset: 0,
          bevelSegments: 8,
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.center();
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
      } else if (type === 'apple') {
        // Apple Body
        const shape = new THREE.Shape();
        shape.moveTo(0, -1.2);
        shape.bezierCurveTo(0.6, -1.8, 1.6, -1.6, 1.8, -0.6);
        shape.bezierCurveTo(2.1, 0.5, 1.6, 1.6, 0.9, 1.7);
        shape.bezierCurveTo(0.4, 1.8, 0.1, 1.4, 0, 1.4);
        shape.bezierCurveTo(-0.1, 1.4, -0.4, 1.8, -0.9, 1.7);
        shape.bezierCurveTo(-1.6, 1.6, -2.1, 0.5, -1.8, -0.6);
        shape.bezierCurveTo(-1.6, -1.6, -0.6, -1.8, 0, -1.2);

        const extrudeSettings = {
          steps: 2,
          depth: 0.35,
          bevelEnabled: true,
          bevelThickness: 0.15,
          bevelSize: 0.12,
          bevelSegments: 8,
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.center();
        const bodyMesh = new THREE.Mesh(geometry, material);
        group.add(bodyMesh);

        // Apple Leaf
        const leafShape = new THREE.Shape();
        leafShape.moveTo(0.1, 1.9);
        leafShape.bezierCurveTo(0.7, 2.3, 0.8, 2.7, 0.2, 2.8);
        leafShape.bezierCurveTo(-0.4, 2.7, -0.3, 2.1, 0.1, 1.9);
        const leafGeometry = new THREE.ExtrudeGeometry(leafShape, {
          depth: 0.12,
          bevelEnabled: true,
          bevelThickness: 0.05,
          bevelSize: 0.04,
          bevelSegments: 4,
        });
        const leafMesh = new THREE.Mesh(leafGeometry, material);
        group.add(leafMesh);
      } else if (type === 'dverse') {
        // D'Verse Architectural 'D' Portal Ring
        const shape = new THREE.Shape();
        shape.moveTo(-1.2, -1.8);
        shape.lineTo(0.1, -1.8);
        shape.bezierCurveTo(1.6, -1.8, 2.4, -0.9, 2.4, 0);
        shape.bezierCurveTo(2.4, 0.9, 1.6, 1.8, 0.1, 1.8);
        shape.lineTo(-1.2, 1.8);
        shape.closePath();

        // Inner Cutout
        const hole = new THREE.Path();
        hole.moveTo(-0.5, -1.1);
        hole.lineTo(0.0, -1.1);
        hole.bezierCurveTo(0.9, -1.1, 1.4, -0.5, 1.4, 0);
        hole.bezierCurveTo(1.4, 0.5, 0.9, 1.1, 0.0, 1.1);
        hole.lineTo(-0.5, 1.1);
        hole.closePath();
        shape.holes.push(hole);

        const extrudeSettings = {
          steps: 2,
          depth: 0.4,
          bevelEnabled: true,
          bevelThickness: 0.16,
          bevelSize: 0.12,
          bevelSegments: 8,
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.center();
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
      } else if (type === 'sphere') {
        const geometry = new THREE.SphereGeometry(1.8, 64, 64);
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
      } else if (type === 'torus') {
        const geometry = new THREE.TorusKnotGeometry(1.3, 0.42, 128, 32);
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
      }

      return group;
    }

    meshGroup = buildModel(currentModel);
    scene.add(meshGroup);

    // 5. LIGHTING SETUP (MATCHING SWIFT BIRD DUAL CHROMATIC SPECULAR HIGHLIGHTS)
    
    // Light 1: Warm Amber Key Rim Light (Bottom-Left)
    const warmLight = new THREE.PointLight(0xffa838, 28 * warmGlowIntensity, 35, 1.8);
    warmLight.position.set(-3.6, -2.8, 2.2);
    scene.add(warmLight);

    // Light 2: Cool Sky Cyan Rim Light (Top-Right)
    const coolLight = new THREE.PointLight(0x54b8ff, 24 * coolGlowIntensity, 35, 1.8);
    coolLight.position.set(3.4, 3.2, 2.2);
    scene.add(coolLight);

    // Light 3: Cursor Point Light (Top / Dynamic Following)
    const cursorLight = new THREE.PointLight(0xffffff, 20 * cursorLightIntensity, 25, 1.6);
    cursorLight.position.set(0, 3.5, 3.0);
    scene.add(cursorLight);

    // Subtle Ambient Light (Deep Obsidian Base)
    const ambientLight = new THREE.AmbientLight(0x101018, 0.45);
    scene.add(ambientLight);

    // 6. ANIMATION & RENDER LOOP
    let animId: number;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const animate = () => {
      // Smooth Cursor Reaction & 3D Tilt
      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;

      targetRotationY = mouseX * 0.28;
      targetRotationX = -mouseY * 0.22;

      meshGroup.rotation.y += (targetRotationY - meshGroup.rotation.y) * 0.08;
      meshGroup.rotation.x += (targetRotationX - meshGroup.rotation.x) * 0.08;

      // Update Cursor Light Position in 3D Space
      cursorLight.position.x = mouseX * 4.5;
      cursorLight.position.y = mouseY * 4.0 + 1.2;
      cursorLight.position.z = 2.8 + Math.abs(mouseX) * 0.5;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    // 7. RESIZE HANDLER
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [currentModel, roughness, metalness, warmGlowIntensity, coolGlowIntensity, cursorLightIntensity]);

  return (
    <div className="relative w-full h-full min-h-[550px] flex items-center justify-center select-none overflow-hidden">
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Atmospheric Background Glow Radial Halo */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 'clamp(320px, 45vw, 650px)',
          height: 'clamp(320px, 45vw, 650px)',
          background:
            'radial-gradient(circle at 35% 65%, rgba(255, 168, 56, 0.18) 0%, rgba(84, 184, 255, 0.12) 45%, transparent 75%)',
          filter: 'blur(50px)',
          zIndex: 0,
        }}
      />
    </div>
  );
};
