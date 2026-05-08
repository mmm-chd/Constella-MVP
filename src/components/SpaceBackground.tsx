import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float } from '@react-three/drei';
import * as THREE from 'three';

const TwinklingStars: React.FC = () => {
  const points = useRef<THREE.Points>(null!);
  
  const { positions, sizes, opacities } = useMemo(() => {
    const count = 5000;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const opacities = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
      sizes[i] = Math.random() * 0.15 + 0.05;
      opacities[i] = Math.random();
    }
    return { positions, sizes, opacities };
  }, []);

  useFrame((state) => {
    if (!points.current) return;
    const t = state.clock.getElapsedTime();
    points.current.rotation.y = t * 0.01;
    
    // Twinkling logic logic could be handled via shader for better perf, 
    // but for 5000 points, we can use a simpler approach or just let them rotate.
    // Let's add a subtle pulsing to the material opacity.
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const Comet: React.FC = () => {
  const mesh = useRef<THREE.Group>(null!);
  const tail = useRef<THREE.Mesh>(null!);
  
  const { position, speed, angle, color } = useMemo(() => {
    const side = Math.random() < 0.5 ? -1 : 1;
    const colors = ["#ffffff", "#60A5FA", "#fef3c7"];
    return {
      position: new THREE.Vector3(side * 25, (Math.random() - 0.5) * 20, -15),
      speed: 0.15 + Math.random() * 0.25,
      angle: side === 1 ? Math.PI * 0.85 : Math.PI * 0.15,
      color: colors[Math.floor(Math.random() * colors.length)]
    };
  }, []);

  useFrame((state) => {
    if (!mesh.current) return;
    
    mesh.current.position.x += Math.cos(angle) * speed;
    mesh.current.position.y += Math.sin(angle) * speed;

    if (tail.current) {
      tail.current.scale.set(1, 1 + Math.sin(state.clock.elapsedTime * 10) * 0.1, 1);
    }

    if (Math.abs(mesh.current.position.x) > 40 || Math.abs(mesh.current.position.y) > 30) {
      mesh.current.position.x = (Math.random() < 0.5 ? -35 : 35);
      mesh.current.position.y = (Math.random() - 0.5) * 20;
    }
  });

  return (
    <group ref={mesh} position={position}>
      {/* Glow */}
      <mesh>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* Core */}
      <mesh>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Tail */}
      <mesh ref={tail} rotation={[0, 0, angle + Math.PI]}>
        <coneGeometry args={[0.05, 3, 12]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.4} 
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

const CometField: React.FC = () => {
  return (
    <group>
      {[...Array(4)].map((_, i) => (
        <Comet key={i} />
      ))}
    </group>
  );
};

export const SpaceBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-[#020617]">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <color attach="background" args={['#020617']} />
        
        <TwinklingStars />
        
        {/* Layered faint background stars */}
        <Stars 
          radius={120} 
          depth={60} 
          count={3000} 
          factor={2} 
          saturation={0} 
          fade 
          speed={0.2} 
        />
        
        <CometField />
        
        <fog attach="fog" args={['#020617', 5, 30]} />
      </Canvas>
      
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/20 via-transparent to-purple-950/10 opacity-30" />
    </div>
  );
};
