import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, useTexture, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { RotateCcw, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface Product3DViewerProps {
  imageUrl?: string;
  productName: string;
  className?: string;
}

// 3D Product Mesh Component
function ProductMesh({ imageUrl, productName }: { imageUrl?: string; productName: string }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  
  // Load texture if image URL is provided
  const texture = imageUrl ? useTexture(imageUrl) : null;
  
  useFrame((state, delta) => {
    if (meshRef.current && !hovered) {
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.1 : 1}
    >
      {/* Main product geometry - using RoundedBox from drei */}
      <RoundedBox args={[2, 1.5, 0.5]} radius={0.1} smoothness={4}>
        {texture ? (
          <meshStandardMaterial 
            map={texture} 
            metalness={0.7}
            roughness={0.3}
          />
        ) : (
          <meshStandardMaterial 
            color="#e0e0e0" 
            metalness={0.7}
            roughness={0.3}
          />
        )}
      </RoundedBox>
      
      {/* Add some details to make it look more like medical equipment */}
      <mesh position={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
      </mesh>
      
      <mesh position={[0.5, 0.3, 0.3]}>
        <boxGeometry args={[0.2, 0.1, 0.1]} />
        <meshStandardMaterial color="#666" />
      </mesh>
    </mesh>
  );
}

const Product3DViewer: React.FC<Product3DViewerProps> = ({ 
  imageUrl, 
  productName, 
  className = "w-full h-96" 
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const controlsRef = useRef<any>(null);

  const resetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const zoomIn = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyIn(0.8);
      controlsRef.current.update();
    }
  };

  const zoomOut = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyOut(0.8);
      controlsRef.current.update();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const containerClass = isFullscreen 
    ? "fixed inset-0 z-50 bg-background" 
    : className;

  return (
    <div className={`relative bg-gradient-to-br from-muted/30 to-muted/60 rounded-lg overflow-hidden border border-border ${containerClass}`}>
      {/* 3D Canvas */}
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        
        {/* Lighting Setup */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />
        
        {/* Environment for reflections */}
        <Environment preset="studio" />
        
        {/* 3D Product */}
        <Suspense fallback={null}>
          <ProductMesh imageUrl={imageUrl} productName={productName} />
        </Suspense>
        
        {/* Ground plane for shadows */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
          <planeGeometry args={[10, 10]} />
          <shadowMaterial opacity={0.2} />
        </mesh>
        
        {/* Orbit Controls */}
        <OrbitControls 
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={false}
          minDistance={2}
          maxDistance={10}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
      
      {/* Control Panel */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={resetView}
          className="bg-background/80 hover:bg-background/90"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={zoomIn}
          className="bg-background/80 hover:bg-background/90"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={zoomOut}
          className="bg-background/80 hover:bg-background/90"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={toggleFullscreen}
          className="bg-background/80 hover:bg-background/90"
        >
          <Maximize className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Product Info Overlay */}
      <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm rounded-md p-3">
        <h3 className="font-semibold text-sm text-foreground">{productName}</h3>
        <p className="text-xs text-muted-foreground">
          Drag to rotate • Scroll to zoom • Click controls for actions
        </p>
      </div>
      
      {/* Close button for fullscreen */}
      {isFullscreen && (
        <Button
          size="sm"
          variant="secondary"
          onClick={toggleFullscreen}
          className="absolute top-4 left-4 bg-background/80 hover:bg-background/90"
        >
          ✕
        </Button>
      )}
    </div>
  );
};

export default Product3DViewer;