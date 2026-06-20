import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Job, Run } from '../lib/mockData';

export interface MapPolygon {
  id: string;
  name: string;
  points: [number, number][];
  color: string;
}

interface Props {
  jobs: Job[];
  runs: Run[];
  selectedRunIds: string[];
  center: [number, number];
  zoom: number;
  polygons?: MapPolygon[];
}

export default function HereMap({ jobs, runs, selectedRunIds, center, zoom, polygons = [] }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const polyLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: true }).setView(center, zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);
    polyLayerRef.current = L.layerGroup().addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [center, zoom]);

  // Render polygons under the markers
  useEffect(() => {
    const layer = polyLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    polygons.forEach(p => {
      L.polygon(p.points, {
        color: p.color,
        weight: 2,
        fillColor: p.color,
        fillOpacity: 0.18,
      })
        .bindTooltip(p.name, { permanent: false, sticky: true })
        .addTo(layer);
    });
  }, [polygons]);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    const visibleRuns = selectedRunIds.length === 0 ? runs.map(r => r.id) : selectedRunIds;
    const runColor: Record<string, string> = {};
    runs.forEach(r => { runColor[r.id] = r.color; });

    // For each job, decide colour. Polygon-zip-match takes priority if polygons are set.
    const polyByZip: Record<string, string> = {};
    polygons.forEach(p => { polyByZip[p.id] = p.color; });

    jobs.forEach(j => {
      if (!j.lat || !j.lng) return;
      const polyColor = j.zipCode ? polyByZip[j.zipCode] : undefined;
      const inSelectedRun = j.runId && visibleRuns.includes(j.runId);
      const unallocated = !j.runId;
      let color: string;
      let opacity: number;
      if (polyColor) {
        color = polyColor;
        opacity = 1;
      } else if (inSelectedRun) {
        color = runColor[j.runId!];
        opacity = 1;
      } else if (unallocated) {
        color = '#9ca3af';
        opacity = 1;
      } else {
        color = 'rgba(150,150,150,0.4)';
        opacity = 0.25;
      }
      L.circleMarker([j.lat, j.lng], {
        radius: 6,
        color: '#fff',
        weight: 1.5,
        fillColor: color,
        fillOpacity: opacity,
      }).bindTooltip(`${j.id} · ${j.customer}${j.runId ? ` · ${j.runId}` : ' · unallocated'}`).addTo(layer);
    });
  }, [jobs, runs, selectedRunIds, polygons]);

  return <div ref={containerRef} className="h-full w-full" />;
}
