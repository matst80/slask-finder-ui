import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { surfaceProps, type WindowConfig } from './config'
import { buildGeometry, lightTransform } from './geometry'

export const WindowModel = ({ config }: { config: WindowConfig }) => {
  const geo = useMemo(() => buildGeometry(config), [config])

  // Dispose superseded geometries when the config changes or on unmount.
  useEffect(
    () => () => {
      geo.frame.dispose()
      geo.rail?.dispose()
      geo.polyGlass?.dispose()
      for (const m of geo.polyBars) m.geometry.dispose()
      for (const m of geo.structures) m.geometry.dispose()
      for (const m of geo.stops) m.geometry.dispose()
      for (const l of geo.lights) {
        l.sash.dispose()
        l.railBar?.dispose()
        for (const b of l.bars) b.geometry.dispose()
      }
    },
    [geo],
  )

  // Surface finish (PVC / wood / aluminium) for all joinery; double-sided
  // because triangle winding isn't relied upon (normals are analytic).
  const frameMaterialProps = {
    ...surfaceProps(config.material),
    side: THREE.DoubleSide,
  }

  // Outward swing moves the free edge away from the camera (-Z); inward flips.
  const angleRad =
    ((config.openAngle * Math.PI) / 180) * (config.openInward ? 1 : -1)
  // Reuse the open-amount slider (0..60) as the slide fraction (0..1).
  const slideFrac = config.openAngle / 60

  return (
    <group position={[0, 0, -geo.centerZ]}>
      <mesh geometry={geo.frame} castShadow receiveShadow>
        <meshStandardMaterial
          color={config.frameColor}
          {...frameMaterialProps}
        />
      </mesh>

      {geo.structures.map((m) => (
        <mesh key={m.key} geometry={m.geometry} castShadow receiveShadow>
          <meshStandardMaterial
            color={config.frameColor}
            {...frameMaterialProps}
          />
        </mesh>
      ))}

      {geo.stops.map((m) => (
        <mesh key={m.key} geometry={m.geometry} castShadow receiveShadow>
          <meshStandardMaterial
            color={config.frameColor}
            {...frameMaterialProps}
          />
        </mesh>
      ))}

      {geo.lights.map((light) => {
        const mode = config.lights[light.key] ?? 'fixed'
        const { outerPos, innerPos, rotation } = lightTransform(
          light,
          mode,
          angleRad,
          slideFrac,
        )
        // Outer group carries the operation (hinge pivot / slide); inner group
        // places the cell-local content back at the cell center.
        return (
          <group key={light.key} position={outerPos} rotation={rotation}>
            <group position={innerPos}>
              <mesh geometry={light.sash} castShadow receiveShadow>
                <meshStandardMaterial
                  color={config.sashColor}
                  {...frameMaterialProps}
                />
              </mesh>
              {light.bars.map((b) => (
                <mesh
                  key={b.key}
                  geometry={b.geometry}
                  castShadow
                  receiveShadow
                >
                  <meshStandardMaterial
                    color={config.sashColor}
                    {...frameMaterialProps}
                  />
                </mesh>
              ))}
              {light.railBar && (
                <mesh geometry={light.railBar} castShadow receiveShadow>
                  <meshStandardMaterial
                    color={config.rainColor}
                    roughness={0.3}
                    metalness={0.9}
                    envMapIntensity={1.1}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              )}
              {light.infills.map((g) =>
                g.kind === 'panel' ? (
                  <mesh
                    key={g.key}
                    position={[g.x, g.y, g.z]}
                    castShadow
                    receiveShadow
                  >
                    <boxGeometry args={[g.width, g.height, g.thickness]} />
                    <meshStandardMaterial
                      color={config.panelColor}
                      {...frameMaterialProps}
                    />
                  </mesh>
                ) : (
                  <mesh key={g.key} position={[g.x, g.y, g.z]}>
                    <boxGeometry args={[g.width, g.height, g.thickness]} />
                    <meshPhysicalMaterial
                      color={config.glassColor}
                      transmission={1}
                      thickness={g.thickness}
                      attenuationColor={config.glassColor}
                      attenuationDistance={0.4}
                      roughness={0.08}
                      metalness={0}
                      ior={1.5}
                      reflectivity={0.5}
                      envMapIntensity={1.2}
                      transparent
                    />
                  </mesh>
                ),
              )}
            </group>
          </group>
        )
      })}

      {geo.rail && (
        <mesh geometry={geo.rail} castShadow receiveShadow>
          <meshStandardMaterial
            color={config.rainColor}
            roughness={0.3}
            metalness={0.9}
            envMapIntensity={1.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {geo.polyBars.map((m) => (
        <mesh key={m.key} geometry={m.geometry} castShadow receiveShadow>
          <meshStandardMaterial
            color={config.sashColor}
            {...frameMaterialProps}
          />
        </mesh>
      ))}

      {geo.polyGlass && (
        <mesh geometry={geo.polyGlass}>
          <meshPhysicalMaterial
            color={config.glassColor}
            transmission={1}
            thickness={config.glassThickness}
            attenuationColor={config.glassColor}
            attenuationDistance={0.4}
            roughness={0.08}
            metalness={0}
            ior={1.5}
            reflectivity={0.5}
            envMapIntensity={1.2}
            transparent
          />
        </mesh>
      )}
    </group>
  )
}
