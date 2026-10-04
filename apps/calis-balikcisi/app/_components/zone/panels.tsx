'use client';

import { useFrame } from '@react-three/fiber';

import { readBrand } from '@/lib/zone/brand';
import {
  FRAME_PROXIMITY,
  frameStop,
  LEVEL_Y,
  MARKER_SIZE,
  PORTAL_MARKER_SIZE,
  PORTAL_PROXIMITY,
  ZONE_FRAMES,
  ZONE_PORTALS,
  type FrameId,
  type PortalId,
} from '@/lib/zone/frames';
import { useFontEpoch } from '@/lib/zone/hooks/use-font-epoch';
import { zoneRuntime } from '@/lib/zone/runtime';
import { useZoneStore } from '@/lib/zone/store';
import { FloorMarker } from './floor-marker';
import { PanelStand } from './panel-stand';

/**
 * Dört ayaklı pano + merdiven geçitleri + zemin halkaları + yakınlık (bölüm 7.1).
 *
 * Yakınlık **durma noktasına** göre ölçülür ve yalnız karakterin BULUNDUĞU kattakilere bakılır.
 * Pano (2.6) ve geçit (1.4) kendi yarıçapıyla yarışır; en yakını kazanır — ikisi aynı anda açık
 * olmaz. `setNear` yalnız değer DEĞİŞİNCE store'a yazar. Masalar yakınlık hesabına girmez.
 */
export function Panels({ reduced }: { reduced: boolean }) {
  const brand = readBrand();
  const fontEpoch = useFontEpoch();

  useFrame(() => {
    const { char } = zoneRuntime();
    let bestD = Infinity;
    let frame: FrameId | null = null;
    let portal: PortalId | null = null;
    for (const f of ZONE_FRAMES) {
      if (f.level !== char.level) continue;
      const [x, , z] = frameStop(f);
      const d = Math.hypot(char.x - x, char.z - z);
      if (d < FRAME_PROXIMITY && d < bestD) {
        bestD = d;
        frame = f.id;
        portal = null;
      }
    }
    for (const p of ZONE_PORTALS) {
      if (p.level !== char.level) continue;
      const d = Math.hypot(char.x - p.x, char.z - p.z);
      if (d < PORTAL_PROXIMITY && d < bestD) {
        bestD = d;
        portal = p.id;
        frame = null;
      }
    }
    useZoneStore.getState().setNear(frame, portal);
  });

  return (
    <group name="zone-panels">
      {ZONE_FRAMES.map((f) => (
        <PanelStand key={f.id} frame={f} brand={brand} fontEpoch={fontEpoch} />
      ))}
      {ZONE_FRAMES.map((f) => (
        <FloorMarker
          key={f.id}
          target={{ kind: 'frame', id: f.id }}
          position={frameStop(f)}
          level={f.level}
          size={MARKER_SIZE}
          reduced={reduced}
          brand={brand}
        />
      ))}
      {ZONE_PORTALS.map((p) => (
        <FloorMarker
          key={p.id}
          target={{ kind: 'portal', id: p.id }}
          position={[p.x, LEVEL_Y[p.level], p.z]}
          level={p.level}
          size={PORTAL_MARKER_SIZE}
          reduced={reduced}
          brand={brand}
        />
      ))}
    </group>
  );
}
