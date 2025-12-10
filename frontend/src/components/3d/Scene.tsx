'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Suspense } from 'react';

export function Scene3D() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedText({ text, className = '' }: { text: string; className?: string }) {
  return (
    <motion.h1
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className={className}
    >
      {text}
    </motion.h1>
  );
}

export function FloatingCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.05, rotateY: 5, z: 50 }}
      className="transform-gpu perspective-1000"
    >
      {children}
    </motion.div>
  );
}
