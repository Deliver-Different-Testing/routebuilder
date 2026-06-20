import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import { mockPolygons, zipPolygons, mockRecurringRoutes } from '../lib/mockData';

interface SavedRouteInfo {
  routeName: string;
  location: string;
  frequency: string;
  serviceLevel: string;
}

interface DrawnPoly {
  id: string;
  points: [number, number][];
  name: string;
  color: string;
  saved?: SavedRouteInfo;
}

const palette = ['#3bc7f4', '#606DB4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const locations = [
  'East Tamaki Depot',
  'Christchurch Central Depot',
  'Auckland Airport Depot',
  'North Shore Depot',
  'Customer: Zimmer Biomet',
  'Customer: Stryker',
  'Customer: Roche Diagnostics',
  'Customer: Fonterra',
];

const frequencies = [
  'Daily',
  'Weekdays (Mon–Fri)',
  'Mon, Wed, Fri',
  'Tue, Thu',
  'Weekly (Mon)',
  'Fortnightly',
  'Monthly',
];

const serviceLevels = [
  'Standard same-day',
  '2-hour express',
  'Overnight',
  'Regional Home Delivery',
];

const STORAGE_KEY = 'polygon-builder-saved-routes';

export default function PolygonBuilder() {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const drawingLayerRef = useRef<L.LayerGroup | null>(null);
  const previewLayerRef = useRef<L.LayerGroup | null>(null);
  const editLayerRef = useRef<L.LayerGroup | null>(null);

  const [drawing, setDrawing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPoints, setCurrentPoints] = useState<[number, number][]>([]);
  const [polys, setPolys] = useState<DrawnPoly[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (_) { return []; }
  });
  const [name, setName] = useState('');
  const [saveTarget, setSaveTarget] = useState<DrawnPoly | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: true }).setView([-36.8485, 174.7633], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);
    drawingLayerRef.current = L.layerGroup().addTo(map);
    previewLayerRef.current = L.layerGroup().addTo(map);
    editLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Re-render persisted polygons on mount (and whenever polys change).
  // Skip the polygon currently being edited — it lives on editLayerRef so we can mutate it directly without rebuilding handles mid-drag.
  useEffect(() => {
    const layer = drawingLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    polys.forEach(p => {
      if (p.id === editingId) return;
      L.polygon(p.points, { color: p.color, fillOpacity: 0.25, weight: 2 })
        .bindTooltip(p.saved ? `${p.saved.routeName} (saved)` : p.name, { permanent: true, direction: 'center' })
        .addTo(layer);
    });
  }, [polys, editingId]);

  // Edit handles — render the polygon being edited + vertex/midpoint handles.
  // CRITICAL: vertex drag mutates the Leaflet polygon directly; React state is only updated on dragend
  // so this useEffect does NOT rebuild on every drag tick (which would kill the drag).
  useEffect(() => {
    const map = mapRef.current;
    const layer = editLayerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    if (!editingId) return;
    const poly = polys.find(p => p.id === editingId);
    if (!poly) return;

    const vertexIcon = (color: string) => L.divIcon({
      className: 'rb-vertex-handle',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      html: `<div style="width:18px;height:18px;background:${color};border:3px solid #fff;border-radius:3px;box-shadow:0 0 0 1px ${color},0 1px 4px rgba(0,0,0,0.3);cursor:grab;margin:2px;"></div>`,
    });

    const midIcon = L.divIcon({
      className: 'rb-mid-handle',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      html: `<div style="width:16px;height:16px;background:#fff;border:2px dashed #606DB4;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#606DB4;font-size:11px;font-weight:bold;line-height:1;">+</div>`,
    });

    // Mutable working copy of points + the live polygon — these update during drag without React re-render
    const workingPoints: [number, number][] = poly.points.map(([a, b]) => [a, b] as [number, number]);

    const editPoly = L.polygon(workingPoints, {
      color: poly.color, fillOpacity: 0.25, weight: 2,
      interactive: false,
    })
      .bindTooltip(poly.saved ? `${poly.saved.routeName} (editing)` : `${poly.name} (editing)`, { permanent: true, direction: 'center' })
      .addTo(layer);

    const midpointMarkers: L.Marker[] = [];

    const refreshMidpoints = () => {
      midpointMarkers.forEach(m => layer.removeLayer(m));
      midpointMarkers.length = 0;
      workingPoints.forEach((a, i) => {
        const b = workingPoints[(i + 1) % workingPoints.length];
        const mid: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        const m = L.marker(mid, { icon: midIcon });
        m.on('click', (e: L.LeafletMouseEvent) => {
          L.DomEvent.stopPropagation(e);
          setPolys(curr => curr.map(p => {
            if (p.id !== poly.id) return p;
            const nextPoints = [...p.points];
            nextPoints.splice(i + 1, 0, mid);
            return { ...p, points: nextPoints };
          }));
        });
        m.bindTooltip('Click to add a vertex here', { permanent: false });
        m.addTo(layer);
        midpointMarkers.push(m);
      });
    };

    // Vertex markers — drag mutates Leaflet, commits to React on dragend
    workingPoints.forEach((pt, i) => {
      const m = L.marker(pt, { icon: vertexIcon(poly.color), draggable: true, autoPan: true });
      m.on('dragstart', () => {
        map.dragging.disable();
        map.doubleClickZoom.disable();
        // Hide midpoints while dragging to reduce visual noise
        midpointMarkers.forEach(mm => layer.removeLayer(mm));
      });
      m.on('drag', (e: L.LeafletEvent) => {
        const ll = (e.target as L.Marker).getLatLng();
        workingPoints[i] = [ll.lat, ll.lng];
        editPoly.setLatLngs(workingPoints);
      });
      m.on('dragend', () => {
        map.dragging.enable();
        map.doubleClickZoom.enable();
        refreshMidpoints();
        // Single commit at end of drag
        setPolys(curr => {
          const next = curr.map(p => p.id === poly.id ? { ...p, points: workingPoints.map(pt => [pt[0], pt[1]] as [number, number]) } : p);
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (_) { /* ignore */ }
          return next;
        });
      });
      m.bindTooltip(`Vertex ${i + 1} — drag to move`, { permanent: false });
      m.addTo(layer);
    });

    refreshMidpoints();
  }, [editingId, polys]);

  const startEdit = (id: string) => {
    setDrawing(false);
    setCurrentPoints([]);
    setEditingId(id);
  };
  const stopEdit = () => {
    setEditingId(null);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(polys)); } catch (_) { /* ignore */ }
  };

  // Snap helpers — find vertex or edge snap target within pixel threshold.
  const SNAP_PX = 14;

  const snapTo = (latlng: L.LatLng): { point: [number, number]; kind: 'vertex' | 'edge' | null } => {
    const map = mapRef.current;
    if (!map) return { point: [latlng.lat, latlng.lng], kind: null };
    const clickPt = map.latLngToContainerPoint(latlng);

    // Pass 1: vertex snap (preferred — sharing exact corners means no gap)
    for (const poly of polys) {
      for (const v of poly.points) {
        const pt = map.latLngToContainerPoint(L.latLng(v[0], v[1]));
        if (clickPt.distanceTo(pt) < SNAP_PX) return { point: [v[0], v[1]], kind: 'vertex' };
      }
    }
    // Also snap to current in-progress polygon's first point so user can close a shape.
    if (currentPoints.length > 0) {
      const v = currentPoints[0];
      const pt = map.latLngToContainerPoint(L.latLng(v[0], v[1]));
      if (clickPt.distanceTo(pt) < SNAP_PX) return { point: [v[0], v[1]], kind: 'vertex' };
    }

    // Pass 2: edge snap — nearest point on each segment
    let best: { point: [number, number]; dist: number } | null = null;
    for (const poly of polys) {
      for (let i = 0; i < poly.points.length; i++) {
        const a = poly.points[i];
        const b = poly.points[(i + 1) % poly.points.length];
        const aPt = map.latLngToContainerPoint(L.latLng(a[0], a[1]));
        const bPt = map.latLngToContainerPoint(L.latLng(b[0], b[1]));
        const proj = projectOnSegment(clickPt, aPt, bPt);
        const d = clickPt.distanceTo(proj);
        if (d < SNAP_PX && (!best || d < best.dist)) {
          const ll = map.containerPointToLatLng(proj);
          best = { point: [ll.lat, ll.lng], dist: d };
        }
      }
    }
    if (best) return { point: best.point, kind: 'edge' };
    return { point: [latlng.lat, latlng.lng], kind: null };
  };

  // Click handler — snap to adjacent polygon vertex/edge to eliminate gaps.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const onClick = (e: L.LeafletMouseEvent) => {
      if (!drawing) return;
      const snap = snapTo(e.latlng);
      setCurrentPoints(p => [...p, snap.point]);
    };
    map.on('click', onClick);
    return () => { map.off('click', onClick); };
  }, [drawing, polys, currentPoints]);

  // Mouse-move snap preview
  useEffect(() => {
    const map = mapRef.current;
    const layer = previewLayerRef.current;
    if (!map || !layer || !drawing) return;
    let snapMarker: L.CircleMarker | null = null;

    const onMove = (e: L.LeafletMouseEvent) => {
      if (snapMarker) { layer.removeLayer(snapMarker); snapMarker = null; }
      const snap = snapTo(e.latlng);
      if (snap.kind) {
        snapMarker = L.circleMarker(snap.point, {
          radius: 8,
          color: snap.kind === 'vertex' ? '#ef4444' : '#f59e0b',
          fillColor: '#fff',
          weight: 3,
          fillOpacity: 1,
        }).bindTooltip(snap.kind === 'vertex' ? 'Snap to vertex' : 'Snap to edge', { permanent: false, sticky: true }).addTo(layer);
      }
    };
    map.on('mousemove', onMove);
    return () => {
      map.off('mousemove', onMove);
      if (snapMarker) layer.removeLayer(snapMarker);
    };
  }, [drawing, polys, currentPoints]);

  // Preview line + markers
  useEffect(() => {
    const map = mapRef.current;
    const layer = previewLayerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    if (currentPoints.length === 0) return;
    if (currentPoints.length >= 2) {
      L.polyline(currentPoints, { color: '#3bc7f4', weight: 2, dashArray: '4 6' }).addTo(layer);
    }
    currentPoints.forEach((pt, i) => {
      L.circleMarker(pt, { radius: 5, color: '#0d0c2c', fillColor: '#3bc7f4', fillOpacity: 1, weight: 2 })
        .bindTooltip(`Point ${i + 1}`, { permanent: false })
        .addTo(layer);
    });
  }, [currentPoints]);

  const persist = (next: DrawnPoly[]) => {
    setPolys(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (_) { /* ignore */ }
  };

  const startDraw = () => { setDrawing(true); setCurrentPoints([]); };

  const finishDraw = () => {
    if (currentPoints.length < 3) {
      alert('A polygon needs at least 3 points.');
      return;
    }
    const color = palette[polys.length % palette.length];
    const finalName = name.trim() || `Polygon ${polys.length + 1}`;
    const newPoly: DrawnPoly = {
      id: `PG-${Date.now()}`,
      points: [...currentPoints],
      name: finalName,
      color,
    };
    persist([...polys, newPoly]);
    setCurrentPoints([]);
    setName('');
    setDrawing(false);
    previewLayerRef.current?.clearLayers();
  };

  const cancelDraw = () => {
    setCurrentPoints([]);
    setDrawing(false);
    previewLayerRef.current?.clearLayers();
  };

  const undoPoint = () => setCurrentPoints(p => p.slice(0, -1));

  const clearAll = () => {
    if (!confirm('Remove all drawn polygons (including saved scheduled routes)?')) return;
    persist([]);
  };

  const removeOne = (id: string) => {
    persist(polys.filter(p => p.id !== id));
  };

  const saveAsRoute = (info: SavedRouteInfo) => {
    if (!saveTarget) return;
    persist(polys.map(p => p.id === saveTarget.id ? { ...p, saved: info } : p));
    setSaveTarget(null);
  };

  const loadZipPolygons = () => {
    // Map each zip to its scheduled route colour (if any) for visual consistency.
    const zipToColor: Record<string, string> = {};
    mockRecurringRoutes.forEach(r => r.zips.forEach(z => { zipToColor[z] = r.color; }));
    const existingZipIds = new Set(polys.filter(p => p.id.startsWith('ZIP-')).map(p => p.id));
    const toAdd: DrawnPoly[] = Object.entries(zipPolygons)
      .filter(([zip]) => !existingZipIds.has(`ZIP-${zip}`))
      .map(([zip, pts]) => ({
        id: `ZIP-${zip}`,
        points: pts,
        name: `Zip ${zip}`,
        color: zipToColor[zip] ?? palette[Math.floor(Math.random() * palette.length)],
      }));
    if (toAdd.length === 0) {
      alert('All known zip polygons are already loaded.');
      return;
    }
    persist([...polys, ...toAdd]);
    // Recenter on Christchurch where the zip polygons live.
    mapRef.current?.setView([-43.56, 172.50], 11);
  };

  return (
    <>
      <PageHeader
        title="Polygon Builder"
        subtitle="NEW. Draw custom zones, then save each one as a Scheduled Route tagged to a depot or customer location."
        actions={
          <button onClick={clearAll} disabled={polys.length === 0} className="text-sm font-medium text-gray-500 hover:text-red-500 disabled:opacity-30">
            Clear all
          </button>
        }
      />

      <div className="p-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card
            title="Map — Auckland metro"
            subtitle={
              editingId
                ? 'Editing — drag any vertex (coloured square) to move it; click a ＋ midpoint to add a new vertex. Click "Done editing" when finished.'
                : drawing
                  ? `Drawing… click to add points (${currentPoints.length} so far). Hover near an existing polygon to snap to its vertex (red ring) or edge (amber ring) — eliminates gaps.`
                  : 'Click "Draw new polygon" to start; new clicks snap to nearby vertices/edges so polygons can share borders. Use "Edit" on a polygon to drag its vertices or add new ones.'
            }
            actions={
              editingId ? (
                <button onClick={stopEdit} className="text-sm font-medium bg-emerald-600 text-white px-4 py-2 rounded-lg hover:brightness-110">
                  ✓ Done editing
                </button>
              ) : drawing ? (
                <div className="flex items-center gap-2">
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Polygon name…"
                    className="text-sm rounded-lg border-gray-300 px-3 py-1.5 w-40"
                  />
                  <button onClick={undoPoint} disabled={currentPoints.length === 0} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40">
                    Undo
                  </button>
                  <button onClick={cancelDraw} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200">
                    Cancel
                  </button>
                  <button onClick={finishDraw} disabled={currentPoints.length < 3} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-brand-cyan text-brand-dark hover:brightness-110 disabled:opacity-40">
                    Finish ({currentPoints.length})
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadZipPolygons}
                    className="text-xs font-medium px-3 py-2 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                    title="Pull in known zip polygons (Christchurch zones) as starting points"
                  >
                    📥 Load zip polygons
                  </button>
                  <button onClick={startDraw} className="text-sm font-medium bg-brand-dark text-white px-4 py-2 rounded-lg hover:bg-brand-purple transition">
                    + Draw new polygon
                  </button>
                </div>
              )
            }
          >
            <div ref={containerRef} className="h-[520px] rounded-lg overflow-hidden border border-gray-200" />
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Drawn polygons" subtitle={polys.length === 0 ? 'None yet' : `${polys.length} polygon${polys.length === 1 ? '' : 's'} · ${polys.filter(p => p.saved).length} saved as routes`}>
            {polys.length === 0 ? (
              <p className="text-xs text-gray-500">Click "+ Draw new polygon", click points on the map, then "Finish". You can then save each one as a scheduled route.</p>
            ) : (
              <ul className="space-y-3">
                {polys.map(p => (
                  <li key={p.id} className="border border-gray-100 rounded-lg p-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: p.color }} />
                      <span className="text-sm font-medium flex-1 truncate">{p.saved ? p.saved.routeName : p.name}</span>
                      <span className="text-xs text-gray-500">{p.points.length} pts</span>
                    </div>
                    {p.saved ? (
                      <div className="mt-1.5 ml-5 text-[10px] text-emerald-700 space-y-0.5">
                        <div className="flex items-center gap-1">✓ Regular route</div>
                        <div className="text-gray-500">📍 {p.saved.location}</div>
                        <div className="text-gray-500">🔁 {p.saved.frequency} · {p.saved.serviceLevel}</div>
                      </div>
                    ) : (
                      <div className="mt-1.5 ml-5 text-[10px] text-gray-400 italic">Not saved as a route yet.</div>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-2 ml-5">
                      {editingId === p.id ? (
                        <button
                          onClick={stopEdit}
                          className="text-[10px] font-semibold bg-emerald-600 text-white px-2 py-1 rounded hover:brightness-110"
                        >
                          ✓ Done editing
                        </button>
                      ) : (
                        <button
                          onClick={() => startEdit(p.id)}
                          className="text-[10px] font-semibold bg-brand-purple text-white px-2 py-1 rounded hover:brightness-110"
                          title="Drag vertices or click + to add new ones"
                        >
                          ✏️ Edit shape
                        </button>
                      )}
                      {!p.saved && (
                        <button
                          onClick={() => setSaveTarget(p)}
                          className="text-[10px] font-semibold bg-brand-cyan text-white px-2 py-1 rounded hover:brightness-110"
                        >
                          💾 Save as scheduled route
                        </button>
                      )}
                      {p.saved && (
                        <button
                          onClick={() => setSaveTarget(p)}
                          className="text-[10px] font-medium text-brand-cyan hover:underline"
                        >
                          Edit details…
                        </button>
                      )}
                      <button
                        onClick={() => removeOne(p.id)}
                        className="text-[10px] text-gray-400 hover:text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Saved polygons (example)" subtitle="Loaded from tblBulkRunPolygon">
            <ul className="space-y-3">
              {mockPolygons.map(p => (
                <li key={p.id} className="border border-gray-100 rounded-lg p-2.5 hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm" style={{ background: p.color }} />
                    <span className="text-sm font-medium flex-1">{p.name}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 ml-5">{p.points} pts · {p.jobsLast30Days} jobs / 30d</div>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Use in route-build">
            <p className="text-xs text-gray-600 leading-relaxed">
              Saved polygons feed into the run-build engine as <strong>geo-gates</strong>. A polygon tagged as a scheduled route appears in the <strong>Scheduled Routes</strong> board with its location, frequency and service level. Persists to <code className="bg-gray-100 px-1 rounded">tblBulkRunPolygon</code> + <code className="bg-gray-100 px-1 rounded">tblRecurringRoute</code>.
            </p>
          </Card>
        </div>
      </div>

      {saveTarget && (
        <SaveAsRouteModal
          target={saveTarget}
          onCancel={() => setSaveTarget(null)}
          onSave={saveAsRoute}
        />
      )}
    </>
  );
}

interface ModalProps {
  target: DrawnPoly;
  onCancel: () => void;
  onSave: (info: SavedRouteInfo) => void;
}

function SaveAsRouteModal({ target, onCancel, onSave }: ModalProps) {
  const [routeName, setRouteName] = useState(target.saved?.routeName ?? target.name);
  const [location, setLocation] = useState(target.saved?.location ?? locations[0]);
  const [frequency, setFrequency] = useState(target.saved?.frequency ?? frequencies[1]);
  const [serviceLevel, setServiceLevel] = useState(target.saved?.serviceLevel ?? serviceLevels[0]);

  return (
    <div className="fixed inset-0 z-[2000] bg-black/40 flex items-center justify-center" onClick={onCancel}>
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white border border-gray-300 shadow-2xl w-[480px]"
      >
        <div className="bg-gray-700 text-white px-4 py-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide">Save polygon as Scheduled Route</span>
          <button onClick={onCancel} className="hover:bg-white/10 px-2 rounded text-sm">✕</button>
        </div>

        <div className="p-5 space-y-3 text-xs">
          <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-2">
            <span className="w-3 h-3 rounded-sm" style={{ background: target.color }} />
            <span>{target.name} · {target.points.length} pts</span>
          </div>

          <Field label="Route name">
            <input
              type="text"
              value={routeName}
              onChange={e => setRouteName(e.target.value)}
              className="w-full rounded border-gray-300 text-xs"
              placeholder="e.g. Zimmer AM Med Auckland"
            />
          </Field>

          <Field label="Tag location">
            <select
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full rounded border-gray-300 text-xs"
            >
              {locations.map(l => <option key={l}>{l}</option>)}
              <option>Custom…</option>
            </select>
            <p className="text-[10px] text-gray-400 mt-1">Depot, customer site, or named location the polygon belongs to.</p>
          </Field>

          <Field label="Frequency">
            <select
              value={frequency}
              onChange={e => setFrequency(e.target.value)}
              className="w-full rounded border-gray-300 text-xs"
            >
              {frequencies.map(f => <option key={f}>{f}</option>)}
            </select>
          </Field>

          <Field label="Service level">
            <select
              value={serviceLevel}
              onChange={e => setServiceLevel(e.target.value)}
              className="w-full rounded border-gray-300 text-xs"
            >
              {serviceLevels.map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>

          <p className="text-[10px] text-gray-500 italic bg-gray-50 border border-gray-200 rounded p-2">
            On save, this polygon becomes a Scheduled Route — visible in the <strong>Scheduled Routes</strong> board, feeding the build engine on the chosen schedule.
          </p>
        </div>

        <div className="border-t border-gray-200 px-4 py-2 flex justify-end gap-2">
          <button onClick={onCancel} className="text-xs px-3 py-1.5 text-gray-500 hover:text-brand-dark">Cancel</button>
          <button
            onClick={() => onSave({ routeName: routeName.trim() || target.name, location, frequency, serviceLevel })}
            disabled={!routeName.trim()}
            className="text-xs font-semibold bg-brand-cyan text-white px-4 py-1.5 rounded hover:brightness-110 disabled:opacity-40"
          >
            💾 Save Scheduled Route
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-semibold text-gray-600 mb-1">{label}</div>
      {children}
    </div>
  );
}

// Project point p onto segment a-b, returning the closest point on the segment.
function projectOnSegment(p: L.Point, a: L.Point, b: L.Point): L.Point {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return a;
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return L.point(a.x + t * dx, a.y + t * dy);
}
