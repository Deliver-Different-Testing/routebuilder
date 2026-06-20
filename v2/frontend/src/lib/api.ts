// ============================================================================
// RouteBuilder v2 API client
// All calls go to /api/* on the same origin (the .NET 9 backend mounts the
// React SPA from wwwroot/app/react, so same-origin XHR works without CORS).
// ============================================================================

import type {
  Job, JobGroup, Run, Fleet, Courier, RecurringRoute,
} from './mockData';

const API_BASE = '/api';

async function jsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} on ${res.url}: ${txt}`);
  }
  return res.json() as Promise<T>;
}

// ─── Backend DTO shapes (mirror /v2/backend/Dtos) ───────────────────────────
export interface JobDtoBackend {
  id: string;            // "{source}::{nativeId}"
  source: 'tblBulkJob' | 'tucJob' | 'tucJobBooking';
  jobNumber: string | null;
  customer: string | null;
  date: string | null;
  readyAt: string | null;
  windowStart: string | null;
  windowEnd: string | null;
  fromAddress: string | null;
  toAddress: string | null;
  fromSuburb: string | null;
  toSuburb: string | null;
  fromPostCode: number | null;
  toPostCode: number | null;
  fromLat: number | null;
  fromLng: number | null;
  toLat: number | null;
  toLng: number | null;
  weightKg: number | null;
  speed: number | null;
  isPickup: boolean;
  assignedRunId: number | null;
  assignedCourierId: number | null;
  courier: string | null;
}

// Map backend DTO → existing frontend Job shape so the cockpit components don't change.
function backendToJob(d: JobDtoBackend): Job {
  return {
    id: d.id,
    source: d.source,
    customer: d.customer ?? '',
    pickup: d.fromAddress ?? '',
    delivery: d.toAddress ?? '',
    weightKg: d.weightKg ?? 0,
    windowStart: d.windowStart ?? '',
    windowEnd: d.windowEnd ?? '',
    type: d.isPickup ? 'pickup' : 'delivery',
    readyAt: d.readyAt ?? '',
    client: d.customer ?? undefined,
    jobNo: d.jobNumber ?? undefined,
    dDate: d.date ? new Date(d.date).toLocaleDateString('en-NZ') : undefined,
    rTime: d.readyAt ?? undefined,
    suburb: d.toSuburb ?? undefined,
    zipCode: d.toPostCode != null ? String(d.toPostCode) : undefined,
    courier: d.courier ?? undefined,
    runId: d.assignedRunId != null ? String(d.assignedRunId) : undefined,
    lat: d.toLat ?? undefined,
    lng: d.toLng ?? undefined,
  };
}

// ─── Jobs ────────────────────────────────────────────────────────────────────
export interface JobQuery {
  date?: Date;
  sources?: string[];
  pickupsOnly?: boolean;
  deliveriesOnly?: boolean;
  zipCodes?: string[];
  search?: string;
}

export async function fetchJobs(q: JobQuery = {}): Promise<Job[]> {
  const qs = new URLSearchParams();
  if (q.date) qs.set('date', q.date.toISOString().slice(0, 10));
  if (q.sources) q.sources.forEach(s => qs.append('sources', s));
  if (q.pickupsOnly !== undefined) qs.set('pickupsOnly', String(q.pickupsOnly));
  if (q.deliveriesOnly !== undefined) qs.set('deliveriesOnly', String(q.deliveriesOnly));
  if (q.zipCodes) q.zipCodes.forEach(z => qs.append('zipCodes', z));
  if (q.search) qs.set('search', q.search);

  const res = await fetch(`${API_BASE}/jobs?${qs}`, { credentials: 'include' });
  const dtos = await jsonOrThrow<JobDtoBackend[]>(res);
  return dtos.map(backendToJob);
}

export async function fetchJobGroups(date: Date, pickupsOnly?: boolean): Promise<JobGroup[]> {
  const qs = new URLSearchParams({ date: date.toISOString().slice(0, 10) });
  if (pickupsOnly !== undefined) qs.set('pickupsOnly', String(pickupsOnly));
  const res = await fetch(`${API_BASE}/jobs/groups?${qs}`, { credentials: 'include' });
  return jsonOrThrow<JobGroup[]>(res);
}

// ─── Runs ────────────────────────────────────────────────────────────────────
export interface RunDtoBackend {
  id: number; name: string | null; mins: number | null; kms: number | null;
  jobs: number | null; courierId: number | null; courier: string | null; status: number | null;
  revenue: number | null; payout: number | null; courierPercentage: number | null;
  created: string | null; despatchDateTime: string | null;
  recurringRouteId: number | null; isPickupRun: boolean | null;
}

function backendToRun(d: RunDtoBackend): Run {
  return {
    id: String(d.id),
    area: d.name ?? '',
    jobs: d.jobs ?? 0,
    mins: d.mins ?? 0,
    km: d.kms ?? 0,
    marginPct: d.courierPercentage ?? 0,
    courier: d.courier ?? undefined,
    color: '#ef4444', // TODO: derive per scheduled-route colour
  };
}

export async function fetchRuns(date?: Date): Promise<Run[]> {
  const qs = new URLSearchParams();
  if (date) qs.set('date', date.toISOString().slice(0, 10));
  const res = await fetch(`${API_BASE}/runs?${qs}`, { credentials: 'include' });
  const dtos = await jsonOrThrow<RunDtoBackend[]>(res);
  return dtos.map(backendToRun);
}

export interface CreateRunRequest {
  name: string;
  recurringRouteId?: number;
  isPickupRun: boolean;
  stops: { source: string; id: string }[];
}

export async function createRun(req: CreateRunRequest): Promise<Run> {
  const res = await fetch(`${API_BASE}/runs`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  return backendToRun(await jsonOrThrow<RunDtoBackend>(res));
}

export async function assignPickupToRun(pickupSource: string, pickupId: string, runId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/runs/assign-pickup`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pickupSource, pickupId, runId: Number(runId) }),
  });
  if (!res.ok) throw new Error(`Assign pickup failed: ${res.status}`);
}

// ─── Fleets + Couriers ──────────────────────────────────────────────────────
export async function fetchFleets(): Promise<Fleet[]> {
  const res = await fetch(`${API_BASE}/fleets`, { credentials: 'include' });
  const rows = await jsonOrThrow<{ ufltId: number; name: string }[]>(res);
  return rows.map(r => ({ name: r.name }));
}

export async function fetchCouriersByFleet(fleetId: number): Promise<Courier[]> {
  const res = await fetch(`${API_BASE}/fleets/${fleetId}/couriers`, { credentials: 'include' });
  const rows = await jsonOrThrow<{ uccrId: number; name: string; fleetId: number | null; status: string }[]>(res);
  return rows.map(r => ({
    id: `C-${r.uccrId}`,
    name: r.name ?? '',
    fleet: '',
    status: (r.status as 'available' | 'on-run' | 'off') ?? 'off',
  }));
}

// ─── Polygons ───────────────────────────────────────────────────────────────
export interface PolygonDtoBackend {
  polygonId: number;
  name: string;
  colorHex: string | null;
  recurringRouteId: number | null;
  tagLocation: string | null;
  points: { lat: number; lng: number }[];
}

export async function fetchPolygons(): Promise<PolygonDtoBackend[]> {
  const res = await fetch(`${API_BASE}/polygons`, { credentials: 'include' });
  return jsonOrThrow<PolygonDtoBackend[]>(res);
}

export async function createPolygon(name: string, colorHex: string, points: { lat: number; lng: number }[]): Promise<PolygonDtoBackend> {
  const res = await fetch(`${API_BASE}/polygons`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, colorHex, points }),
  });
  return jsonOrThrow<PolygonDtoBackend>(res);
}

export async function updatePolygon(id: number, patch: { name?: string; colorHex?: string; points?: { lat: number; lng: number }[] }): Promise<PolygonDtoBackend> {
  const res = await fetch(`${API_BASE}/polygons/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  return jsonOrThrow<PolygonDtoBackend>(res);
}

export async function deletePolygon(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/polygons/${id}`, { method: 'DELETE', credentials: 'include' });
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
}

export async function savePolygonAsScheduledRoute(polygonId: number, body: {
  routeName: string; tagLocation: string; frequency: string;
  timeWindowStart?: string; timeWindowEnd?: string; serviceLevel?: string; zipCodes: string[];
}): Promise<number> {
  const res = await fetch(`${API_BASE}/polygons/${polygonId}/save-as-scheduled-route`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return jsonOrThrow<number>(res);
}

// ─── Scheduled Routes ───────────────────────────────────────────────────────
export interface ScheduledRouteDtoBackend {
  recurringRouteId: number;
  name: string;
  frequency: string;
  timeWindowStart: string | null;
  timeWindowEnd: string | null;
  avgJobs: number;
  serviceLevel: string | null;
  tagLocation: string | null;
  colorHex: string | null;
  isActive: boolean;
  lastBuiltUtc: string | null;
  zipCodes: string[];
}

export async function fetchScheduledRoutes(): Promise<RecurringRoute[]> {
  const res = await fetch(`${API_BASE}/scheduled-routes`, { credentials: 'include' });
  const dtos = await jsonOrThrow<ScheduledRouteDtoBackend[]>(res);
  return dtos.map(d => ({
    id: `RR-${d.recurringRouteId}`,
    name: d.name,
    frequency: d.frequency,
    timeWindow: d.timeWindowStart && d.timeWindowEnd ? `${d.timeWindowStart}–${d.timeWindowEnd}` : '',
    avgJobs: d.avgJobs,
    lastBuilt: d.lastBuiltUtc ? new Date(d.lastBuiltUtc).toLocaleString('en-NZ') : '',
    live: d.isActive,
    color: d.colorHex ?? '#606DB4',
    zips: d.zipCodes,
  }));
}
