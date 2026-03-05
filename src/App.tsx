import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Text, Float, ContactShadows } from '@react-three/drei'
import { Suspense, useState, useRef, useCallback, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Lobster Claw Component
function LobsterClaw({ position, isGrabbing, isDescending }: { position: [number, number, number]; isGrabbing: boolean; isDescending: boolean }) {
  const clawGroupRef = useRef<THREE.Group>(null!)
  const leftClawRef = useRef<THREE.Group>(null!)
  const rightClawRef = useRef<THREE.Group>(null!)
  const [clawAngle, setClawAngle] = useState(0.4)

  useFrame((state, delta) => {
    // Animate claw opening/closing
    const targetAngle = isGrabbing ? 0.1 : 0.4
    setClawAngle(prev => THREE.MathUtils.lerp(prev, targetAngle, delta * 3))

    if (leftClawRef.current && rightClawRef.current) {
      leftClawRef.current.rotation.z = clawAngle
      rightClawRef.current.rotation.z = -clawAngle
    }

    // Subtle wobble when moving
    if (clawGroupRef.current) {
      clawGroupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.02
    }
  })

  return (
    <group ref={clawGroupRef} position={position}>
      {/* Cable */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 3, 8]} />
        <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Main body - Lobster shell segment */}
      <mesh position={[0, 0, 0]}>
        <capsuleGeometry args={[0.25, 0.3, 8, 16]} />
        <meshStandardMaterial color="#c41e3a" metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Shell texture bumps */}
      {[...Array(8)].map((_, i) => (
        <mesh key={i} position={[
          Math.cos(i * Math.PI / 4) * 0.22,
          0.1 - (i % 3) * 0.1,
          Math.sin(i * Math.PI / 4) * 0.22
        ]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#a01830" roughness={0.5} />
        </mesh>
      ))}

      {/* Left Claw */}
      <group ref={leftClawRef} position={[-0.15, -0.3, 0]}>
        {/* Upper arm */}
        <mesh position={[-0.15, -0.2, 0]} rotation={[0, 0, 0.3]}>
          <capsuleGeometry args={[0.12, 0.4, 8, 16]} />
          <meshStandardMaterial color="#c41e3a" metalness={0.3} roughness={0.4} />
        </mesh>
        {/* Pincer */}
        <mesh position={[-0.35, -0.5, 0]} rotation={[0, 0, 0.5]}>
          <boxGeometry args={[0.3, 0.15, 0.08]} />
          <meshStandardMaterial color="#d42a4a" metalness={0.3} roughness={0.4} />
        </mesh>
        {/* Pincer serrations */}
        {[...Array(4)].map((_, i) => (
          <mesh key={i} position={[-0.25 - i * 0.06, -0.55, 0]} rotation={[0, 0, 0.3]}>
            <coneGeometry args={[0.03, 0.08, 4]} />
            <meshStandardMaterial color="#d42a4a" />
          </mesh>
        ))}
      </group>

      {/* Right Claw */}
      <group ref={rightClawRef} position={[0.15, -0.3, 0]}>
        {/* Upper arm */}
        <mesh position={[0.15, -0.2, 0]} rotation={[0, 0, -0.3]}>
          <capsuleGeometry args={[0.12, 0.4, 8, 16]} />
          <meshStandardMaterial color="#c41e3a" metalness={0.3} roughness={0.4} />
        </mesh>
        {/* Pincer */}
        <mesh position={[0.35, -0.5, 0]} rotation={[0, 0, -0.5]}>
          <boxGeometry args={[0.3, 0.15, 0.08]} />
          <meshStandardMaterial color="#d42a4a" metalness={0.3} roughness={0.4} />
        </mesh>
        {/* Pincer serrations */}
        {[...Array(4)].map((_, i) => (
          <mesh key={i} position={[0.25 + i * 0.06, -0.55, 0]} rotation={[0, 0, -0.3]}>
            <coneGeometry args={[0.03, 0.08, 4]} />
            <meshStandardMaterial color="#d42a4a" />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// Prize toy component
function Prize({ position, color, shape, isHeld }: { position: [number, number, number]; color: string; shape: 'bear' | 'star' | 'ball' | 'duck' | 'gem'; isHeld: boolean }) {
  const ref = useRef<THREE.Group>(null!)
  const [bobOffset] = useState(Math.random() * Math.PI * 2)

  useFrame((state) => {
    if (ref.current && !isHeld) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.5 + bobOffset
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + bobOffset) * 0.02
    }
  })

  const renderShape = () => {
    switch (shape) {
      case 'bear':
        return (
          <>
            {/* Body */}
            <mesh position={[0, 0.15, 0]}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial color={color} roughness={0.8} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 0.35, 0]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial color={color} roughness={0.8} />
            </mesh>
            {/* Ears */}
            <mesh position={[-0.08, 0.45, 0]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshStandardMaterial color={color} roughness={0.8} />
            </mesh>
            <mesh position={[0.08, 0.45, 0]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshStandardMaterial color={color} roughness={0.8} />
            </mesh>
            {/* Eyes */}
            <mesh position={[-0.04, 0.37, 0.1]}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshStandardMaterial color="#111" />
            </mesh>
            <mesh position={[0.04, 0.37, 0.1]}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshStandardMaterial color="#111" />
            </mesh>
          </>
        )
      case 'star':
        return (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.08, 5]} />
            <meshStandardMaterial color={color} metalness={0.6} roughness={0.2} emissive={color} emissiveIntensity={0.3} />
          </mesh>
        )
      case 'ball':
        return (
          <>
            <mesh>
              <sphereGeometry args={[0.15, 32, 32]} />
              <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
            </mesh>
            {/* Stripe */}
            <mesh rotation={[0, 0, Math.PI / 4]}>
              <torusGeometry args={[0.15, 0.02, 8, 32]} />
              <meshStandardMaterial color="white" />
            </mesh>
          </>
        )
      case 'duck':
        return (
          <>
            {/* Body */}
            <mesh position={[0, 0.1, 0]}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial color={color} roughness={0.7} />
            </mesh>
            {/* Head */}
            <mesh position={[0.1, 0.25, 0]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial color={color} roughness={0.7} />
            </mesh>
            {/* Beak */}
            <mesh position={[0.2, 0.23, 0]} rotation={[0, 0, -0.2]}>
              <coneGeometry args={[0.04, 0.08, 8]} />
              <meshStandardMaterial color="#ff6600" />
            </mesh>
            {/* Eye */}
            <mesh position={[0.15, 0.28, 0.06]}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshStandardMaterial color="#111" />
            </mesh>
          </>
        )
      case 'gem':
        return (
          <mesh rotation={[0, Math.PI / 4, 0]}>
            <octahedronGeometry args={[0.15]} />
            <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} transparent opacity={0.8} />
          </mesh>
        )
    }
  }

  return (
    <group ref={ref} position={position}>
      {renderShape()}
    </group>
  )
}

// Claw Machine Cabinet
function ClawMachine({ clawPosition, isGrabbing, isDescending }: { clawPosition: [number, number, number]; isGrabbing: boolean; isDescending: boolean }) {
  return (
    <group>
      {/* Glass walls */}
      {/* Front */}
      <mesh position={[0, 1, 1.5]} receiveShadow>
        <boxGeometry args={[3, 2, 0.05]} />
        <meshPhysicalMaterial color="#88ccff" transparent opacity={0.15} metalness={0.1} roughness={0.1} transmission={0.9} />
      </mesh>
      {/* Back */}
      <mesh position={[0, 1, -1.5]}>
        <boxGeometry args={[3, 2, 0.05]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Left */}
      <mesh position={[-1.5, 1, 0]}>
        <boxGeometry args={[0.05, 2, 3]} />
        <meshPhysicalMaterial color="#88ccff" transparent opacity={0.15} metalness={0.1} roughness={0.1} transmission={0.9} />
      </mesh>
      {/* Right */}
      <mesh position={[1.5, 1, 0]}>
        <boxGeometry args={[0.05, 2, 3]} />
        <meshPhysicalMaterial color="#88ccff" transparent opacity={0.15} metalness={0.1} roughness={0.1} transmission={0.9} />
      </mesh>

      {/* Base */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[3.2, 0.2, 3.2]} />
        <meshStandardMaterial color="#2d2d44" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Floor - ocean themed */}
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <boxGeometry args={[2.9, 0.02, 2.9]} />
        <meshStandardMaterial color="#0a4f6d" metalness={0.2} roughness={0.8} />
      </mesh>

      {/* Top frame */}
      <mesh position={[0, 2.1, 0]}>
        <boxGeometry args={[3.2, 0.2, 3.2]} />
        <meshStandardMaterial color="#c41e3a" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Rails for claw movement */}
      <mesh position={[0, 2.8, 0]}>
        <boxGeometry args={[2.8, 0.1, 0.1]} />
        <meshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[clawPosition[0], 2.8, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[2.8, 0.1, 0.1]} />
        <meshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* The Lobster Claw */}
      <LobsterClaw position={clawPosition} isGrabbing={isGrabbing} isDescending={isDescending} />

      {/* Neon lights */}
      <NeonTube position={[-1.4, 2.05, 1.4]} rotation={[0, Math.PI / 2, 0]} color="#ff0066" />
      <NeonTube position={[1.4, 2.05, 1.4]} rotation={[0, Math.PI / 2, 0]} color="#00ffff" />
      <NeonTube position={[-1.4, 2.05, -1.4]} rotation={[0, Math.PI / 2, 0]} color="#00ffff" />
      <NeonTube position={[1.4, 2.05, -1.4]} rotation={[0, Math.PI / 2, 0]} color="#ff0066" />

      {/* Prize chute */}
      <mesh position={[1.2, 0.3, 1.6]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[0.6, 0.4, 0.3]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Signage */}
      <group position={[0, 2.6, 1.55]}>
        <mesh>
          <boxGeometry args={[2.5, 0.6, 0.1]} />
          <meshStandardMaterial color="#c41e3a" metalness={0.4} roughness={0.5} />
        </mesh>
        <Text
          position={[0, 0, 0.06]}
          fontSize={0.25}
          color="#fff"
          font="https://fonts.gstatic.com/s/pressstart2p/v15/e3t4euO8T-267oIAQAu6jDQyK3nVivNm4I81.woff2"
          anchorX="center"
          anchorY="middle"
        >
          LOBSTER GRAB
        </Text>
      </group>
    </group>
  )
}

function NeonTube({ position, rotation, color }: { position: [number, number, number]; rotation?: [number, number, number]; color: string }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <cylinderGeometry args={[0.03, 0.03, 2.6, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
      <pointLight color={color} intensity={0.5} distance={2} />
    </group>
  )
}

// Prizes arrangement
const prizes = [
  { position: [-0.8, 0.2, -0.8] as [number, number, number], color: '#ff69b4', shape: 'bear' as const },
  { position: [0.5, 0.15, -0.5] as [number, number, number], color: '#ffd700', shape: 'star' as const },
  { position: [-0.3, 0.15, 0.6] as [number, number, number], color: '#ff4444', shape: 'ball' as const },
  { position: [0.7, 0.2, 0.7] as [number, number, number], color: '#ffcc00', shape: 'duck' as const },
  { position: [0, 0.15, 0] as [number, number, number], color: '#00ffcc', shape: 'gem' as const },
  { position: [-0.6, 0.2, 0.2] as [number, number, number], color: '#9966ff', shape: 'bear' as const },
  { position: [0.4, 0.15, -0.9] as [number, number, number], color: '#66ff66', shape: 'ball' as const },
  { position: [-0.9, 0.15, 0.8] as [number, number, number], color: '#ff66cc', shape: 'star' as const },
]

function Scene() {
  const [clawX, setClawX] = useState(0)
  const [clawZ, setClawZ] = useState(0)
  const [clawY, setClawY] = useState(2)
  const [isGrabbing, setIsGrabbing] = useState(false)
  const [isDescending, setIsDescending] = useState(false)
  const [gameState, setGameState] = useState<'idle' | 'moving' | 'descending' | 'grabbing' | 'ascending' | 'returning'>('idle')
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState('Use arrow keys or buttons to move!')

  const moveSpeed = 0.05
  const bounds = { x: 1.1, z: 1.1 }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameState !== 'idle' && gameState !== 'moving') return

    setGameState('moving')
    switch (e.key) {
      case 'ArrowLeft':
        setClawX(x => Math.max(-bounds.x, x - moveSpeed))
        break
      case 'ArrowRight':
        setClawX(x => Math.min(bounds.x, x + moveSpeed))
        break
      case 'ArrowUp':
        setClawZ(z => Math.max(-bounds.z, z - moveSpeed))
        break
      case 'ArrowDown':
        setClawZ(z => Math.min(bounds.z, z + moveSpeed))
        break
      case ' ':
        e.preventDefault()
        triggerGrab()
        break
    }
  }, [gameState])

  const triggerGrab = useCallback(() => {
    if (gameState !== 'idle' && gameState !== 'moving') return

    setGameState('descending')
    setIsDescending(true)
    setMessage('Going down...')

    // Descend
    let y = 2
    const descendInterval = setInterval(() => {
      y -= 0.03
      setClawY(y)
      if (y <= 0.5) {
        clearInterval(descendInterval)
        setIsGrabbing(true)
        setGameState('grabbing')
        setMessage('GRABBING!')

        // Check if we got a prize
        const gotPrize = Math.random() > 0.5

        // Wait then ascend
        setTimeout(() => {
          setGameState('ascending')
          setMessage(gotPrize ? 'Got something!' : 'Almost had it...')

          const ascendInterval = setInterval(() => {
            y += 0.03
            setClawY(y)
            if (y >= 2) {
              clearInterval(ascendInterval)
              setIsDescending(false)

              if (gotPrize) {
                setScore(s => s + 100)
                setMessage('🦞 WINNER! +100 points!')
              }

              // Return to center and reset
              setGameState('returning')
              setTimeout(() => {
                setIsGrabbing(false)
                setClawX(0)
                setClawZ(0)
                setGameState('idle')
                setMessage('Use arrow keys or buttons to move!')
              }, 1000)
            }
          }, 20)
        }, 500)
      }
    }, 20)
  }, [gameState])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleMove = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (gameState !== 'idle' && gameState !== 'moving') return
    setGameState('moving')
    switch (direction) {
      case 'left':
        setClawX(x => Math.max(-bounds.x, x - moveSpeed * 3))
        break
      case 'right':
        setClawX(x => Math.min(bounds.x, x + moveSpeed * 3))
        break
      case 'up':
        setClawZ(z => Math.max(-bounds.z, z - moveSpeed * 3))
        break
      case 'down':
        setClawZ(z => Math.min(bounds.z, z + moveSpeed * 3))
        break
    }
  }

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={1} castShadow shadow-mapSize={[2048, 2048]} />
      <pointLight position={[0, 3, 0]} intensity={0.5} color="#ff6b6b" />

      {/* Environment */}
      <Environment preset="night" />
      <fog attach="fog" args={['#0a0a1a', 5, 20]} />

      {/* Main claw machine */}
      <ClawMachine
        clawPosition={[clawX, clawY, clawZ]}
        isGrabbing={isGrabbing}
        isDescending={isDescending}
      />

      {/* Prizes */}
      {prizes.map((prize, i) => (
        <Float key={i} speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
          <Prize {...prize} isHeld={false} />
        </Float>
      ))}

      {/* Contact shadows for depth */}
      <ContactShadows position={[0, 0.01, 0]} opacity={0.4} scale={10} blur={2} far={4} />

      {/* Floor */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0a0a1a" />
      </mesh>

      {/* UI Overlay using Drei's Html */}
      <group position={[0, 4, 0]}>
        <Float speed={3} rotationIntensity={0} floatIntensity={0.5}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.3}
            color="#ffd700"
            font="https://fonts.gstatic.com/s/pressstart2p/v15/e3t4euO8T-267oIAQAu6jDQyK3nVivNm4I81.woff2"
            anchorX="center"
            anchorY="middle"
          >
            SCORE: {score}
          </Text>
        </Float>
      </group>

      {/* Controls */}
      <OrbitControls
        enablePan={false}
        minDistance={4}
        maxDistance={10}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        enableDamping
      />

      {/* Pass game controls to parent */}
      <GameControls
        onMove={handleMove}
        onGrab={triggerGrab}
        message={message}
        gameState={gameState}
        score={score}
      />
    </>
  )
}

// Separate component to lift controls state up
function GameControls({ onMove, onGrab, message, gameState, score }: {
  onMove: (dir: 'left' | 'right' | 'up' | 'down') => void;
  onGrab: () => void;
  message: string;
  gameState: string;
  score: number;
}) {
  // This component doesn't render anything in the 3D scene
  // We'll handle the UI in the main App component using React portals or state lifting
  return null
}

export default function App() {
  const [clawX, setClawX] = useState(0)
  const [clawZ, setClawZ] = useState(0)
  const [clawY, setClawY] = useState(2)
  const [isGrabbing, setIsGrabbing] = useState(false)
  const [isDescending, setIsDescending] = useState(false)
  const [gameState, setGameState] = useState<'idle' | 'moving' | 'descending' | 'grabbing' | 'ascending' | 'returning'>('idle')
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState('Use arrow keys or buttons to move!')

  const moveSpeed = 0.05
  const bounds = { x: 1.1, z: 1.1 }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameState !== 'idle' && gameState !== 'moving') return

    setGameState('moving')
    switch (e.key) {
      case 'ArrowLeft':
        setClawX(x => Math.max(-bounds.x, x - moveSpeed))
        break
      case 'ArrowRight':
        setClawX(x => Math.min(bounds.x, x + moveSpeed))
        break
      case 'ArrowUp':
        setClawZ(z => Math.max(-bounds.z, z - moveSpeed))
        break
      case 'ArrowDown':
        setClawZ(z => Math.min(bounds.z, z + moveSpeed))
        break
      case ' ':
        e.preventDefault()
        triggerGrab()
        break
    }
  }, [gameState])

  const triggerGrab = useCallback(() => {
    if (gameState !== 'idle' && gameState !== 'moving') return

    setGameState('descending')
    setIsDescending(true)
    setMessage('Going down...')

    let y = 2
    const descendInterval = setInterval(() => {
      y -= 0.03
      setClawY(y)
      if (y <= 0.5) {
        clearInterval(descendInterval)
        setIsGrabbing(true)
        setGameState('grabbing')
        setMessage('GRABBING!')

        const gotPrize = Math.random() > 0.5

        setTimeout(() => {
          setGameState('ascending')
          setMessage(gotPrize ? 'Got something!' : 'Almost had it...')

          const ascendInterval = setInterval(() => {
            y += 0.03
            setClawY(y)
            if (y >= 2) {
              clearInterval(ascendInterval)
              setIsDescending(false)

              if (gotPrize) {
                setScore(s => s + 100)
                setMessage('🦞 WINNER! +100 points!')
              }

              setGameState('returning')
              setTimeout(() => {
                setIsGrabbing(false)
                setClawX(0)
                setClawZ(0)
                setGameState('idle')
                setMessage('Use arrow keys or buttons to move!')
              }, 1000)
            }
          }, 20)
        }, 500)
      }
    }, 20)
  }, [gameState])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleMove = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (gameState !== 'idle' && gameState !== 'moving') return
    setGameState('moving')
    switch (direction) {
      case 'left':
        setClawX(x => Math.max(-bounds.x, x - moveSpeed * 3))
        break
      case 'right':
        setClawX(x => Math.min(bounds.x, x + moveSpeed * 3))
        break
      case 'up':
        setClawZ(z => Math.max(-bounds.z, z - moveSpeed * 3))
        break
      case 'down':
        setClawZ(z => Math.min(bounds.z, z + moveSpeed * 3))
        break
    }
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a1a2e 100%)' }}>
      {/* Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 3, 6], fov: 50 }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <directionalLight position={[5, 8, 5]} intensity={1} castShadow shadow-mapSize={[2048, 2048]} />
          <pointLight position={[0, 3, 0]} intensity={0.5} color="#ff6b6b" />

          {/* Environment */}
          <Environment preset="night" />
          <fog attach="fog" args={['#0a0a1a', 5, 20]} />

          {/* Main claw machine */}
          <ClawMachine
            clawPosition={[clawX, clawY, clawZ]}
            isGrabbing={isGrabbing}
            isDescending={isDescending}
          />

          {/* Prizes */}
          {prizes.map((prize, i) => (
            <Float key={i} speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
              <Prize {...prize} isHeld={false} />
            </Float>
          ))}

          {/* Contact shadows for depth */}
          <ContactShadows position={[0, 0.01, 0]} opacity={0.4} scale={10} blur={2} far={4} />

          {/* Floor */}
          <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#0a0a1a" />
          </mesh>

          {/* 3D Score */}
          <group position={[0, 3.8, 0]}>
            <Float speed={3} rotationIntensity={0} floatIntensity={0.5}>
              <Text
                position={[0, 0, 0]}
                fontSize={0.25}
                color="#ffd700"
                font="https://fonts.gstatic.com/s/pressstart2p/v15/e3t4euO8T-267oIAQAu6jDQyK3nVivNm4I81.woff2"
                anchorX="center"
                anchorY="middle"
              >
                {`SCORE: ${score}`}
              </Text>
            </Float>
          </group>

          {/* Controls */}
          <OrbitControls
            enablePan={false}
            minDistance={4}
            maxDistance={10}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.2}
            enableDamping
          />
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 md:p-6 pointer-events-none">
        <div className="flex flex-col items-center gap-2">
          <h1
            className="text-2xl md:text-4xl font-bold tracking-wider"
            style={{
              fontFamily: "'Press Start 2P', cursive",
              color: '#ff4466',
              textShadow: '0 0 10px #ff4466, 0 0 20px #ff4466, 0 0 30px #ff4466, 2px 2px 0 #000'
            }}
          >
            🦞 LOBSTER GRAB
          </h1>
          <div
            className="text-sm md:text-base px-4 py-2 rounded-lg"
            style={{
              fontFamily: "'Press Start 2P', cursive",
              background: 'rgba(0,0,0,0.7)',
              color: '#00ffcc',
              textShadow: '0 0 5px #00ffcc',
              border: '2px solid #00ffcc',
              boxShadow: '0 0 10px rgba(0,255,204,0.3)'
            }}
          >
            {message}
          </div>
        </div>
      </div>

      {/* Mobile Controls */}
      <div className="absolute bottom-20 left-0 right-0 flex justify-center items-center pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-center gap-2">
          {/* D-Pad */}
          <div className="grid grid-cols-3 gap-1">
            <div></div>
            <button
              onTouchStart={() => handleMove('up')}
              onClick={() => handleMove('up')}
              className="w-14 h-14 md:w-16 md:h-16 rounded-lg flex items-center justify-center transition-all active:scale-95"
              style={{
                background: 'linear-gradient(145deg, #2a2a4a, #1a1a3a)',
                border: '2px solid #444',
                boxShadow: '0 4px 15px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
              }}
            >
              <span className="text-2xl">▲</span>
            </button>
            <div></div>

            <button
              onTouchStart={() => handleMove('left')}
              onClick={() => handleMove('left')}
              className="w-14 h-14 md:w-16 md:h-16 rounded-lg flex items-center justify-center transition-all active:scale-95"
              style={{
                background: 'linear-gradient(145deg, #2a2a4a, #1a1a3a)',
                border: '2px solid #444',
                boxShadow: '0 4px 15px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
              }}
            >
              <span className="text-2xl">◀</span>
            </button>
            <button
              onTouchStart={triggerGrab}
              onClick={triggerGrab}
              disabled={gameState !== 'idle' && gameState !== 'moving'}
              className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
              style={{
                background: gameState === 'idle' || gameState === 'moving'
                  ? 'linear-gradient(145deg, #c41e3a, #8a1428)'
                  : 'linear-gradient(145deg, #444, #333)',
                border: '3px solid #ff6b6b',
                boxShadow: '0 4px 20px rgba(196,30,58,0.5), inset 0 2px 0 rgba(255,255,255,0.2)'
              }}
            >
              <span className="text-xl">🦞</span>
            </button>
            <button
              onTouchStart={() => handleMove('right')}
              onClick={() => handleMove('right')}
              className="w-14 h-14 md:w-16 md:h-16 rounded-lg flex items-center justify-center transition-all active:scale-95"
              style={{
                background: 'linear-gradient(145deg, #2a2a4a, #1a1a3a)',
                border: '2px solid #444',
                boxShadow: '0 4px 15px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
              }}
            >
              <span className="text-2xl">▶</span>
            </button>

            <div></div>
            <button
              onTouchStart={() => handleMove('down')}
              onClick={() => handleMove('down')}
              className="w-14 h-14 md:w-16 md:h-16 rounded-lg flex items-center justify-center transition-all active:scale-95"
              style={{
                background: 'linear-gradient(145deg, #2a2a4a, #1a1a3a)',
                border: '2px solid #444',
                boxShadow: '0 4px 15px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
              }}
            >
              <span className="text-2xl">▼</span>
            </button>
            <div></div>
          </div>

          <p
            className="text-xs mt-2 opacity-60"
            style={{ fontFamily: "'Press Start 2P', cursive", color: '#888' }}
          >
            SPACE = GRAB
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="absolute bottom-0 left-0 right-0 py-3 text-center"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
          fontFamily: "'Press Start 2P', cursive"
        }}
      >
        <p className="text-xs text-gray-500">
          Requested by <span className="text-gray-400">@BetrNames</span> · Built by <span className="text-gray-400">@clonkbot</span>
        </p>
      </footer>
    </div>
  )
}
