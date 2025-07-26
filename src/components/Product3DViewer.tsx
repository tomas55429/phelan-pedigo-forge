import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, useTexture, RoundedBox, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { RotateCcw, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface Product3DViewerProps {
  imageUrl?: string;
  modelUrl?: string;
  productName: string;
  className?: string;
}

// GLB Model Component  
function GLBModel({ modelUrl, productName }: { modelUrl: string; productName: string }) {
  const meshRef = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  
  const { scene } = useGLTF(modelUrl);
  
  useFrame((state, delta) => {
    // Rotation disabled - no automatic rotation
  });

   return (
     <group
       ref={meshRef}
       position={[0, 0, 0]}
       onPointerOver={() => setHovered(true)}
       onPointerOut={() => setHovered(false)}
       scale={hovered ? 1.1 : 1}
     >
       <primitive object={scene} />
     </group>
   );
}

// Fallback 3D Product Mesh Component
function FallbackMesh({ productName }: { productName: string }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state, delta) => {
    // Rotation disabled - no automatic rotation
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, 0, 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.1 : 1}
    >
      {/* Main product geometry - using RoundedBox from drei */}
      <RoundedBox args={[2, 1.5, 0.5]} radius={0.1} smoothness={4}>
        <meshStandardMaterial 
          color="#e0e0e0" 
          metalness={0.7}
          roughness={0.3}
        />
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

// 3D Product Component that chooses between GLB and fallback
function ProductMesh({ modelUrl, productName }: { modelUrl?: string; productName: string }) {
  if (modelUrl) {
    return <GLBModel modelUrl={modelUrl} productName={productName} />;
  }
  return <FallbackMesh productName={productName} />;
}

const Product3DViewer: React.FC<Product3DViewerProps> = ({ 
  imageUrl, 
  modelUrl,
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
    <div className={`relative bg-gradient-to-br from-muted/30 to-muted/60 rounded-lg overflow-hidden border border-border ${containerClass} ${!isFullscreen ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}>
      {/* Click overlay for enlarging when not in fullscreen */}
      {!isFullscreen && (
        <div 
          className="absolute inset-0 z-10" 
          onClick={toggleFullscreen}
          title="Click to enlarge 3D view"
        />
      )}
      
      {/* 3D Canvas */}
      <Canvas shadows className={isFullscreen ? 'cursor-default' : 'pointer-events-none'}>
        <PerspectiveCamera makeDefault position={[0, 0, 120]} fov={45} />
        
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
        <Suspense fallback={<FallbackMesh productName={productName} />}>
          <ProductMesh modelUrl={modelUrl} productName={productName} />
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
          minDistance={80}
          maxDistance={200}
          maxPolarAngle={Math.PI / 2}
          enabled={isFullscreen}
        />
      </Canvas>
      
      {/* Control Panel */}
      <div className={`absolute top-4 right-4 flex flex-col space-y-2 ${!isFullscreen ? 'z-20' : ''}`}>
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
      <div className={`absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm rounded-md p-3 ${!isFullscreen ? 'z-20' : ''}`}>
        <h3 className="font-semibold text-sm text-foreground">{productName}</h3>
        <p className="text-xs text-muted-foreground">
          {isFullscreen ? 'Drag to rotate • Scroll to zoom • Click controls for actions' : 'Click to enlarge and interact with 3D view'}
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