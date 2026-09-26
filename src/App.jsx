import * as THREE from 'three'
import React, { Suspense, useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, extend, useThree, useFrame } from '@react-three/fiber'
import { 
  Environment, 
  Lightformer, 
  Text, 
  RoundedBox,
  useTexture,
  ContactShadows
} from '@react-three/drei'
import { 
  Physics, 
  RigidBody, 
  BallCollider, 
  CuboidCollider, 
  useRopeJoint, 
  useSphericalJoint 
} from '@react-three/rapier'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import logoUrl from './assets/logoubd.png'

// Daftarkan MeshLine ke React Three Fiber
extend({ MeshLineGeometry, MeshLineMaterial })

// Fungsi membuat tekstur kain lanyard resmi Universitas Bina Darma
function createLanyardTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 128
  const ctx = canvas.getContext('2d')

  // Background pita biru tua resmi UBD
  ctx.fillStyle = '#0b3b82'
  ctx.fillRect(0, 0, 1024, 128)

  // Aksen garis tepi emas halus
  ctx.strokeStyle = '#eab308'
  ctx.lineWidth = 4
  ctx.strokeRect(0, 2, 1024, 124)

  // Pola jahitan benang putih tipis
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
  ctx.lineWidth = 2
  ctx.setLineDash([8, 8])
  ctx.strokeRect(6, 8, 1012, 112)
  ctx.setLineDash([])

  // Tulisan sablon lanyard resmi
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 34px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.letterSpacing = '2px'
  ctx.fillText('UNIVERSITAS BINA DARMA  •  BINA DARMA BERMUTU', 512, 64)

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(3, 1)
  texture.needsUpdate = true
  return texture
}

function Band() {
  const band = useRef()
  const fixed = useRef()
  const j1 = useRef()
  const j2 = useRef()
  const j3 = useRef()
  const card = useRef()

  // Muat logo resmi UBD dari asset ter-bundle
  const logoTexture = useTexture(logoUrl)

  const vec = useRef(new THREE.Vector3()).current
  const ang = useRef(new THREE.Vector3()).current
  const rot = useRef(new THREE.Vector3()).current
  const dir = useRef(new THREE.Vector3()).current

  const [dragged, drag] = useState(false)
  const [hovered, hover] = useState(false)

  const rotY = useRef(0)
  const spinVelY = useRef(0)
  const pointerDownPos = useRef({ x: 0, y: 0, time: 0 })
  const lastClientPos = useRef({ x: 0, y: 0 })
  const mouseVel = useRef(new THREE.Vector3())
  const prevWorldPos = useRef(new THREE.Vector3())
  const quat = useRef(new THREE.Quaternion()).current
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ')).current

  const { width, height } = useThree((state) => state.size)
  const [curve] = useState(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3()
  ]))

  const lanyardTexture = useMemo(() => createLanyardTexture(), [])

  // Sambungan Tali Fisika (Taut & Stabil)
  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1.15])
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1.15])
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1.15])

  // Sambungan Bola antara ujung tali (j3) dengan ujung atas kartu
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.48, 0]])

  // Perubahan kursor saat hover dan drag
  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab'
      return () => { document.body.style.cursor = 'auto' }
    }
  }, [hovered, dragged])

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime()

    // 1. Logika saat kartu ditarik kursor (Drag Interaction)
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
      dir.copy(vec).sub(state.camera.position).normalize()
      vec.add(dir.multiplyScalar(state.camera.position.length()))

      const targetX = vec.x - dragged.x
      const targetY = vec.y - dragged.y
      const targetZ = vec.z - dragged.z

      card.current?.setNextKinematicTranslation({
        x: targetX,
        y: targetY,
        z: targetZ
      })

      // Hitung kecepatan lemparan kursor di ruang 3D
      const currentPos = new THREE.Vector3(targetX, targetY, targetZ)
      if (prevWorldPos.current.lengthSq() > 0) {
        mouseVel.current.copy(currentPos).sub(prevWorldPos.current).divideScalar(Math.max(delta, 0.016))
      }
      prevWorldPos.current.copy(currentPos)

      // Putar manual kartu di sumbu Y mengikuti geseran kursor mouse
      const deltaX = (state.pointer.x - lastClientPos.current.x) * 8.0
      lastClientPos.current.x = state.pointer.x
      lastClientPos.current.y = state.pointer.y

      rotY.current += deltaX
      spinVelY.current = deltaX * 25.0

      euler.set(0, rotY.current, 0, 'YXZ')
      quat.setFromEuler(euler)
      card.current?.setNextKinematicRotation(quat)

      // Bangunkan sendi-sendi tali
      card.current?.wakeUp()
      j1.current?.wakeUp()
      j2.current?.wakeUp()
      j3.current?.wakeUp()
    } else {
      lastClientPos.current.x = state.pointer.x
      lastClientPos.current.y = state.pointer.y
      prevWorldPos.current.set(0, 0, 0)

      // 2. Ayunan Lembut Alami saat diam
      const windX = Math.sin(time * 1.5) * 0.05 + Math.cos(time * 0.8) * 0.02
      const windZ = Math.cos(time * 1.2) * 0.03
      card.current?.applyImpulse({ x: windX * 0.012, y: 0, z: windZ * 0.012 }, true)
    }

    // 3. Update kelengkungan tali lanyard secara stabil, anggun & bebas getaran (Anti-Jitter)
    if (fixed.current && j1.current && j2.current && j3.current && band.current) {
      const p3 = j3.current.translation()
      const p2 = j2.current.translation()
      const p1 = j1.current.translation()
      const pF = fixed.current.translation()

      curve.points[0].copy(p3)
      curve.points[1].lerp(p2, 0.8)
      curve.points[2].lerp(p1, 0.8)
      curve.points[3].copy(pF)

      band.current.geometry.setPoints(curve.getPoints(32))
    }

    // 4. Efek stabilisasi agar kartu menghadap ke sisi terdekat yang aktif (Depan atau Belakang)
    if (card.current && !dragged) {
      ang.copy(card.current.angvel())
      rot.copy(card.current.rotation())

      const nearestTargetY = Math.round(rot.y / Math.PI) * Math.PI
      const diffY = rot.y - nearestTargetY

      card.current.setAngvel({ x: ang.x * 0.98, y: ang.y - diffY * 0.35, z: ang.z * 0.98 })
    }
  })

  curve.curveType = 'centripetal'

  return (
    <>
      {/* Titik jangkar tetap di atas */}
      <RigidBody ref={fixed} type="fixed" position={[0, 4.0, 0]} />

      {/* Rantai Sendi Fisika Tali (Rope Nodes) Terkondisi Stabil Tanpa Getar */}
      <RigidBody position={[0.3, 3.1, 0]} ref={j1} linearDamping={2.6} angularDamping={2.6}>
        <BallCollider args={[0.08]} />
      </RigidBody>
      <RigidBody position={[0.6, 2.1, 0]} ref={j2} linearDamping={2.6} angularDamping={2.6}>
        <BallCollider args={[0.08]} />
      </RigidBody>
      <RigidBody position={[0.9, 1.1, 0]} ref={j3} linearDamping={2.2} angularDamping={2.2}>
        <BallCollider args={[0.08]} />
      </RigidBody>

      {/* Tali Lanyard Pita Bertekstur */}
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          useMap={1}
          map={lanyardTexture}
          repeat={new THREE.Vector2(3, 1)}
          depthTest={false}
          resolution={[width, height]}
          lineWidth={0.17}
        />
      </mesh>

      {/* Kartu Lencana 3D */}
      <RigidBody
        ref={card}
        position={[1.2, -0.5, 0]}
        type={dragged ? 'kinematicPosition' : 'dynamic'}
        linearDamping={0.65}
        angularDamping={0.75}
      >
        <CuboidCollider args={[0.92, 1.38, 0.04]} />
        <group
          onPointerOver={() => hover(true)}
          onPointerOut={() => hover(false)}
          onPointerDown={(e) => {
            e.stopPropagation()
            e.target.setPointerCapture?.(e.pointerId)
            pointerDownPos.current = { x: e.clientX, y: e.clientY, time: performance.now() }
            lastClientPos.current = { x: e.clientX, y: e.clientY }
            prevWorldPos.current.set(0, 0, 0)

            // Baca rotasi kartu saat ini agar mulus saat mulai di-drag
            if (card.current) {
              const r = card.current.rotation()
              quat.set(r.x, r.y, r.z, r.w)
              euler.setFromQuaternion(quat, 'YXZ')
              rotY.current = euler.y
            }

            drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())))
          }}
          onPointerUp={(e) => {
            e.stopPropagation()
            e.target.releasePointerCapture?.(e.pointerId)
            drag(false)

            const dist = Math.hypot(e.clientX - pointerDownPos.current.x, e.clientY - pointerDownPos.current.y)
            const duration = performance.now() - pointerDownPos.current.time

            if (dist < 8 && duration < 350) {
              // KLIK BIASA -> Balikkan 180° langsung secara dinamis!
              if (card.current) {
                card.current.wakeUp()
                const r = card.current.rotation()
                quat.set(r.x, r.y, r.z, r.w)
                euler.setFromQuaternion(quat, 'YXZ')
                const isFacingFront = Math.abs(euler.y % (Math.PI * 2)) < Math.PI * 0.5
                card.current.applyTorqueImpulse({ x: 0, y: isFacingFront ? 1.4 : -1.4, z: 0 }, true)
              }
            } else {
              // Selesai drag -> Efek pegas melenting melompat tinggi ke atas yang stabil!
              if (card.current) {
                card.current.wakeUp()
                j1.current?.wakeUp()
                j2.current?.wakeUp()
                j3.current?.wakeUp()

                // Hitung seberapa jauh kartu ditarik ke bawah
                const currentTrans = card.current.translation()
                const pullDownDistance = Math.max(0, 0.5 - currentTrans.y)

                // Gaya lenting melompat ke atas terukur & stabil
                const slingshotJumpY = THREE.MathUtils.clamp(Math.pow(pullDownDistance, 1.25) * 4.8, 0, 15)

                // Kecepatan lemparan mouse
                const flingX = THREE.MathUtils.clamp(mouseVel.current.x * 0.4, -12, 12)
                const flingY = THREE.MathUtils.clamp(mouseVel.current.y * 0.5, -5, 18)
                const flingZ = THREE.MathUtils.clamp(mouseVel.current.z * 0.4, -10, 10)

                // Terapkan impuls lompatan tinggi terkontrol!
                card.current.applyImpulse({
                  x: flingX,
                  y: slingshotJumpY + Math.max(0, flingY),
                  z: flingZ
                }, true)

                // Berikan putaran momentum tangan
                card.current.setAngvel({ x: 0, y: THREE.MathUtils.clamp(spinVelY.current, -8, 8), z: 0 }, true)
              }
            }
          }}
          onWheel={(e) => {
            e.stopPropagation()
            if (card.current) {
              card.current.wakeUp()
              const spinDelta = (e.deltaY || e.deltaX) * 0.005
              card.current.applyTorqueImpulse({ x: 0, y: spinDelta, z: 0 }, true)
            }
          }}
        >
          {/* ================= PENGIT LOGAM & KLIP STAINLESS ================= */}
          <group position={[0, 1.42, 0]}>
            {/* Ring Kait Baja Tahan Karat */}
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <torusGeometry args={[0.11, 0.022, 16, 32]} />
              <meshStandardMaterial metalness={0.92} roughness={0.15} color="#e2e8f0" />
            </mesh>
            {/* Klip Pengait Logam */}
            <mesh position={[0, -0.11, 0]} castShadow>
              <boxGeometry args={[0.28, 0.09, 0.08]} />
              <meshStandardMaterial metalness={0.92} roughness={0.15} color="#94a3b8" />
            </mesh>
            {/* Baut Pin */}
            <mesh position={[0, -0.11, 0.045]}>
              <cylinderGeometry args={[0.02, 0.02, 0.02, 12]} rotation={[Math.PI / 2, 0, 0]} />
              <meshStandardMaterial metalness={0.95} roughness={0.2} color="#cbd5e1" />
            </mesh>
          </group>

          {/* ================= HOLDER KACA AKRILIK TRANSPARAN (ACRYLIC SLEEVE) ================= */}
          <RoundedBox args={[1.88, 2.8, 0.038]} radius={0.08} smoothness={4} castShadow receiveShadow>
            <meshPhysicalMaterial
              color="#ffffff"
              roughness={0.05}
              metalness={0.05}
              transmission={0.88}
              thickness={0.15}
              ior={1.49}
              transparent={true}
              opacity={0.95}
              clearcoat={1}
              clearcoatRoughness={0.04}
              depthWrite={false}
            />
          </RoundedBox>

          {/* Lubang Gantungan Oval di Bagian Atas Akrilik */}
          <mesh position={[0, 1.22, 0]}>
            <capsuleGeometry args={[0.035, 0.16, 16, 16]} rotation={[0, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#0f172a" roughness={0.6} />
          </mesh>

          {/* ================= KARTU IDENTITAS FISIK (PRINTED INSERT CARD) ================= */}
          <mesh position={[0, -0.04, 0]}>
            <boxGeometry args={[1.76, 2.42, 0.012]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.35} metalness={0.05} />
          </mesh>

          {/* ================= SISI DEPAN (FRONT FACE) ================= */}
          <group position={[0, 0, 0.021]}>
            {/* 1. LOGO RESMI UNIVERSITAS BINA DARMA */}
            <mesh position={[0, 0.72, 0.002]}>
              <planeGeometry args={[1.25, 1.25]} />
              <meshBasicMaterial
                map={logoTexture}
                transparent={true}
                alphaTest={0.01}
                toneMapped={false}
              />
            </mesh>

            {/* Garis Aksen Pembatas Elegan */}
            <mesh position={[0, 0.36, 0.002]}>
              <planeGeometry args={[1.5, 0.015]} />
              <meshStandardMaterial color="#0b3b82" />
            </mesh>

            {/* 2. FAKULTAS */}
            <Text
              position={[0, 0.22, 0.002]}
              fontSize={0.082}
              color="#0b3b82"
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.14}
            >
              FAKULTAS SAINTEK
            </Text>

            {/* 3. NAMA MAHASISWA (BESAR & TEBAL) */}
            <Text
              position={[0, 0.01, 0.002]}
              fontSize={0.108}
              color="#0f172a"
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.02}
            >
              BAGASKARA AMUKTI PALAPA
            </Text>

            {/* 4. PROGRAM STUDI */}
            <Text
              position={[0, -0.18, 0.002]}
              fontSize={0.088}
              color="#475569"
              anchorX="center"
              anchorY="middle"
            >
              Teknik Informatika
            </Text>

            {/* 5. BADGE PILL "MAHASISWA" YANG RAPI & TAJAM */}
            <group position={[0, -0.52, 0.002]}>
              <RoundedBox args={[1.28, 0.24, 0.003]} radius={0.06} smoothness={4}>
                <meshStandardMaterial color="#0b3b82" roughness={0.3} metalness={0.05} />
              </RoundedBox>
              <Text
                position={[0, 0, 0.004]}
                fontSize={0.096}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                letterSpacing={0.18}
                depthOffset={-1}
              >
                MAHASISWA
              </Text>
            </group>

            {/* 6. SLOGAN KAMPUS */}
            <Text
              position={[0, -0.88, 0.002]}
              fontSize={0.08}
              color="#64748b"
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.2}
            >
              BINA DARMA BERMUTU
            </Text>
          </group>

          {/* ================= SISI BELAKANG (BACK FACE) ================= */}
          <group position={[0, 0, -0.021]} rotation={[0, Math.PI, 0]}>
            {/* Pita Magnetik Hitam Rapi */}
            <mesh position={[0, 0.95, 0.002]}>
              <planeGeometry args={[1.74, 0.26]} />
              <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
            </mesh>

            {/* Logo Watermark Halus di Belakang */}
            <mesh position={[0, 0.15, 0.002]}>
              <planeGeometry args={[0.9, 0.9]} />
              <meshBasicMaterial
                map={logoTexture}
                transparent={true}
                opacity={0.14}
                alphaTest={0.01}
                toneMapped={false}
              />
            </mesh>

            {/* Judul Kartu Belakang */}
            <Text
              position={[0, 0.48, 0.003]}
              fontSize={0.075}
              color="#0b3b82"
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.1}
            >
              KARTU MAHASISWA
            </Text>

            {/* Ketentuan Resmi Penggunaan Kartu */}
            <Text
              position={[0, 0.15, 0.003]}
              fontSize={0.058}
              color="#334155"
              maxWidth={1.45}
              lineHeight={1.45}
              textAlign="center"
              anchorX="center"
              anchorY="middle"
            >
              Kartu ini merupakan tanda pengenal sah mahasiswa Universitas Bina Darma Palembang. Wajib dikenakan selama kegiatan akademik di lingkungan kampus.
            </Text>

            {/* Garis Aksen Belakang */}
            <mesh position={[0, -0.25, 0.002]}>
              <planeGeometry args={[1.4, 0.012]} />
              <meshStandardMaterial color="#cbd5e1" />
            </mesh>

            {/* Alamat Resmi Kampus UBD */}
            <Text
              position={[0, -0.45, 0.003]}
              fontSize={0.054}
              color="#64748b"
              maxWidth={1.45}
              lineHeight={1.4}
              textAlign="center"
              anchorX="center"
              anchorY="middle"
            >
              Jl. Jenderal Ahmad Yani No. 3, Palembang, Sumatera Selatan
            </Text>

            {/* Website Resmi UBD */}
            <Text
              position={[0, -0.72, 0.003]}
              fontSize={0.072}
              color="#0b3b82"
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.08}
            >
              www.binadarma.ac.id
            </Text>

            <Text
              position={[0, -0.92, 0.003]}
              fontSize={0.062}
              color="#0b3b82"
              fontWeight="bold"
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.08}
            >
              BINA DARMA BERMUTU
            </Text>
          </group>
        </group>
      </RigidBody>
    </>
  )
}

export default function App() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#0b0f17',
      overflow: 'hidden'
    }}>
      {/* 3D Canvas Scene - Pure Lanyard & Card Only */}
      <Canvas
        camera={{ position: [0, 0.2, 11.2], fov: 36 }}
        shadows
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#0b0f17']} />

        {/* Pencahayaan Studio Alami & Halus */}
        <ambientLight intensity={0.9} />
        {/* Lampu Utama Lembut */}
        <directionalLight
          position={[4, 8, 6]}
          intensity={1.8}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0001}
        />
        {/* Lampu Pengisi Sisi Kiri */}
        <directionalLight position={[-4, 4, 3]} intensity={0.7} />

        <Suspense fallback={null}>
          {/* Simulasi Fisika Rapier dengan Gravitasi Bouncy */}
          <Physics interpolate gravity={[0, -22, 0]} timeStep={1 / 60}>
            <Band />
          </Physics>

          {/* Lingkungan Studio untuk Refleksi Kaca Akrilik */}
          <Environment preset="studio" />

          {/* Bayangan Kontak Lembut di Bawah */}
          <ContactShadows
            position={[0, -4.2, 0]}
            opacity={0.4}
            scale={12}
            blur={2.5}
            far={5}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
