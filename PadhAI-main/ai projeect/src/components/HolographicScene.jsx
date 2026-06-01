import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, OrbitControls, Stars, Float, Ring } from '@react-three/drei';
import * as THREE from 'three';

const AIBrain = () => {
  const meshRef = useRef();
  const ringRef = useRef();
  const ring2Ref = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.3;
      meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.1;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = clock.getElapsedTime() * 0.5;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -clock.getElapsedTime() * 0.3;
      ring2Ref.current.rotation.y = clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <>
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.8}>
        <Sphere ref={meshRef} args={[1.2, 64, 64]} position={[0, 0, 0]}>
          <MeshDistortMaterial
            color="#1e40af"
            emissive="#3b82f6"
            emissiveIntensity={0.8}
            metalness={0.9}
            roughness={0.1}
            distort={0.4}
            speed={2}
          />
        </Sphere>

        <Sphere args={[1.25, 16, 16]} position={[0, 0, 0]}>
          <meshBasicMaterial color="#60a5fa" wireframe transparent opacity={0.15} />
        </Sphere>

        <Ring ref={ringRef} args={[1.8, 1.85, 64]} rotation={[Math.PI / 3, 0, 0]}>
          <meshBasicMaterial color="#8b5cf6" transparent opacity={0.6} side={THREE.DoubleSide} />
        </Ring>

        <Ring ref={ring2Ref} args={[2.2, 2.25, 64]} rotation={[Math.PI / 5, Math.PI / 4, 0]}>
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.4} side={THREE.DoubleSide} />
        </Ring>

        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i / 6) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(angle) * 1.85, Math.sin(angle) * 1.85 * 0.5, Math.sin(angle) * 0.5]}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? '#8b5cf6' : '#06b6d4'}
                emissive={i % 2 === 0 ? '#8b5cf6' : '#06b6d4'}
                emissiveIntensity={2}
              />
            </mesh>
          );
        })}
      </Float>
    </>
  );
};

// CSS fallback when WebGL is unavailable
const FallbackBrain = () => (
  <div className="w-full h-full flex items-center justify-center relative">
    {/* Animated CSS rings fallback */}
    <div className="relative w-64 h-64">
      <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 rotate-slow" />
      <div className="absolute inset-4 rounded-full border border-purple-500/40 rotate-reverse" />
      <div className="absolute inset-8 rounded-full border border-cyan-500/30 rotate-slow" style={{ animationDuration: '12s' }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 blur-md opacity-80 pulse-glow float-animation" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 opacity-90 float-animation" />
      </div>
    </div>
  </div>
);

const HolographicScene = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 60 }}
      style={{ width: '100%', height: '100%' }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false,
      }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          console.warn('WebGL context lost – hiding 3D scene');
        });
      }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={2} color="#3b82f6" />
      <pointLight position={[-5, -5, -5]} intensity={1.5} color="#8b5cf6" />
      <pointLight position={[0, 5, -5]} intensity={1} color="#06b6d4" />
      <Stars radius={100} depth={50} count={2000} factor={3} saturation={0} fade speed={1} />
      <AIBrain />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 3}
      />
    </Canvas>
  );
};

export { FallbackBrain };
export default HolographicScene;
