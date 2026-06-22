export interface Job {
  id: string;
  source: 'tblBulkJob' | 'tucJob' | 'tucJobBooking';
  customer: string;
  pickup: string;
  delivery: string;
  weightKg: number;
  windowStart: string;
  windowEnd: string;
  type: 'delivery' | 'pickup';
  readyAt: string;
  client?: string;
  jobNo?: string;
  dDate?: string;
  rTime?: string;
  suburb?: string;
  zipCode?: string;
  courier?: string;
  runId?: string;
  lat?: number;
  lng?: number;
}

export interface JobGroup { readyAt: string; count: number }
export interface Run {
  id: string;
  area: string;
  jobs: number;
  mins: number;
  km: number;
  marginPct: number;
  courier?: string;
  color: string;
}
export interface Fleet { name: string }
export interface Courier { id: string; name: string; fleet: string; status: 'available' | 'on-run' | 'off' }

export const mockJobs: Job[] = [
  { id: 'J-10042', source: 'tblBulkJob', customer: 'Zimmer Biomet', client: 'WOOP', jobNo: 'WC8800318DEL', pickup: 'East Tamaki', delivery: 'Fangwei Xiao, 142 Aberdeen Road', weightKg: 12, windowStart: '08:00', windowEnd: '10:00', readyAt: '04:00', type: 'delivery', dDate: '15/06/2026', rTime: '12:00:00', suburb: 'Prebbleton', zipCode: '7604', courier: 'Prebb', runId: 'cw2', lat: -43.526, lng: 172.395 },
  { id: 'J-10043', source: 'tblBulkJob', customer: 'Stryker', client: 'WOOP', jobNo: 'WC8800579DEL', pickup: 'East Tamaki', delivery: 'Sarah Brown, 3 Pointsman Place', weightKg: 18, windowStart: '09:00', windowEnd: '11:00', readyAt: '07:00', type: 'delivery', dDate: '15/06/2026', rTime: '12:00:00', suburb: 'Halswell', zipCode: '8025', courier: 'Prebb', runId: 'cw2', lat: -43.546, lng: 172.534 },
  { id: 'J-10044', source: 'tucJob', customer: 'Fonterra', client: 'WOOP', jobNo: 'WC8800170DEL', pickup: 'Henderson', delivery: 'Rebekah Miller, 4A Skara Brae', weightKg: 45, windowStart: '10:00', windowEnd: '12:00', readyAt: '07:00', type: 'delivery', dDate: '15/06/2026', rTime: '12:00:00', suburb: 'Halswell', zipCode: '8025', courier: 'Prebb', runId: 'cw2', lat: -43.561, lng: 172.526 },
  { id: 'J-10045', source: 'tucJob', customer: 'NuVasive', client: 'WOOP', jobNo: 'WC8800558DEL', pickup: 'Airport', delivery: 'Karen Kaller, 8 Highland Brae', weightKg: 8, windowStart: '07:30', windowEnd: '09:30', readyAt: '12:00', type: 'delivery', dDate: '15/06/2026', rTime: '12:00:00', suburb: 'Halswell', zipCode: '8025', courier: 'Halsw', runId: 'cw3', lat: -43.582, lng: 172.553 },
  { id: 'J-10046', source: 'tucJobBooking', customer: 'Roche Diagnostics', client: 'FARON', jobNo: 'E8797SHDEL', pickup: 'Mt Wellington', delivery: 'Anna Bouterey, 1 Woodleigh Lane', weightKg: 6, windowStart: '11:00', windowEnd: '13:00', readyAt: '07:00', type: 'delivery', dDate: '15/06/2026', rTime: '12:00:00', suburb: 'Lincoln', zipCode: '7608', courier: 'Prebb', runId: 'cw2', lat: -43.640, lng: 172.486 },
  { id: 'J-10047', source: 'tblBulkJob', customer: 'Pharma Express', client: 'WOOP', jobNo: 'WC8801142DEL', pickup: 'Otahuhu', delivery: 'Lisa Barr, 67 Mardyke Street', weightKg: 22, windowStart: '13:00', windowEnd: '15:00', readyAt: '12:00', type: 'delivery', dDate: '15/06/2026', rTime: '12:00:00', suburb: 'Halswell', zipCode: '8025', runId: 'CWN', lat: -43.555, lng: 172.587 },
  { id: 'J-10048', source: 'tucJob', customer: 'B. Braun', client: 'WOOP', jobNo: 'WC8800700DEL', pickup: 'Albany', delivery: 'Chris Cooper, 14 …', weightKg: 14, windowStart: '14:00', windowEnd: '16:00', readyAt: '13:00', type: 'delivery', dDate: '15/06/2026', rTime: '12:00:00', suburb: 'Rolleston', zipCode: '7614', lat: -43.591, lng: 172.388 },
  { id: 'J-10049', source: 'tblBulkJob', customer: 'AC Pharma', client: 'WOOP', jobNo: 'WC8801201DEL', pickup: 'East Tamaki', delivery: 'Riverside Medical', weightKg: 5, windowStart: '13:30', windowEnd: '15:30', readyAt: '13:00', type: 'delivery', dDate: '15/06/2026', rTime: '12:00:00', suburb: 'Springston', zipCode: '7616', lat: -43.673, lng: 172.476 },
  { id: 'J-10050', source: 'tucJob', customer: 'Medical Direct', client: 'WOOP', jobNo: 'WC8801308DEL', pickup: 'Penrose', delivery: 'Halswell Clinic', weightKg: 11, windowStart: '15:00', windowEnd: '17:00', readyAt: '18:00', type: 'delivery', dDate: '15/06/2026', rTime: '12:00:00', suburb: 'Halswell', zipCode: '8025', lat: -43.547, lng: 172.553 },
  // Pickups in Christchurch — by-zip auto-match to delivery runs (cw2 covers 7604+7608, cw3 covers 8025); P-20014/15 are unmatched and render grey.
  { id: 'P-20011', source: 'tucJobBooking', customer: 'Halswell Pharmacy', client: 'WOOP', jobNo: 'WC8810011PCK', pickup: 'Halswell, 8 Templeton St', delivery: 'Depot', weightKg: 8, windowStart: '14:00', windowEnd: '16:00', readyAt: '14:00', type: 'pickup', dDate: '15/06/2026', rTime: '14:00:00', suburb: 'Halswell', zipCode: '8025', lat: -43.554, lng: 172.547 },
  { id: 'P-20012', source: 'tucJobBooking', customer: 'Prebbleton Clinic', client: 'WOOP', jobNo: 'WC8810012PCK', pickup: 'Prebbleton, 24 Branthwaite Dr', delivery: 'Depot', weightKg: 4, windowStart: '14:30', windowEnd: '16:30', readyAt: '14:00', type: 'pickup', dDate: '15/06/2026', rTime: '14:30:00', suburb: 'Prebbleton', zipCode: '7604', lat: -43.521, lng: 172.402 },
  { id: 'P-20013', source: 'tucJob', customer: 'Lincoln Vet', client: 'WOOP', jobNo: 'WC8810013PCK', pickup: 'Lincoln, 12 Gerald St', delivery: 'Depot', weightKg: 6, windowStart: '15:00', windowEnd: '17:00', readyAt: '15:00', type: 'pickup', dDate: '15/06/2026', rTime: '15:00:00', suburb: 'Lincoln', zipCode: '7608', lat: -43.642, lng: 172.480 },
  { id: 'P-20014', source: 'tucJob', customer: 'Sumner Surf Co.', client: 'FARON', jobNo: 'E8810014PCK', pickup: 'Sumner Beach Rd', delivery: 'Depot', weightKg: 3, windowStart: '15:30', windowEnd: '17:30', readyAt: '15:00', type: 'pickup', dDate: '15/06/2026', rTime: '15:30:00', suburb: 'Sumner', zipCode: '8081', lat: -43.567, lng: 172.760 },
  { id: 'P-20015', source: 'tucJobBooking', customer: 'Akaroa Cheese', client: 'WOOP', jobNo: 'WC8810015PCK', pickup: 'Akaroa Wharf', delivery: 'Depot', weightKg: 12, windowStart: '16:00', windowEnd: '18:00', readyAt: '16:00', type: 'pickup', dDate: '15/06/2026', rTime: '16:00:00', suburb: 'Akaroa', zipCode: '7520', lat: -43.804, lng: 172.967 },
];

export const mockGroupsDelivery: JobGroup[] = [
  { readyAt: '04:00', count: 6 },
  { readyAt: '07:00', count: 30 },
  { readyAt: '12:00', count: 20 },
  { readyAt: '12:30', count: 3 },
  { readyAt: '13:00', count: 1 },
  { readyAt: '18:00', count: 2 },
];

export const mockGroupsPickup: JobGroup[] = [
  { readyAt: '14:00', count: 4 },
  { readyAt: '15:00', count: 9 },
  { readyAt: '16:00', count: 5 },
  { readyAt: '17:00', count: 2 },
];

export const mockRunsDelivery: Run[] = [
  { id: 'WHH01', area: 'WHH01 5010, 5018, 5022, 5032, 5012', jobs: 16, mins: 0, km: 0, marginPct: 0, courier: 'Unassigned', color: '#9ca3af' },
  { id: 'CWN',   area: 'CWN 8014–8020', jobs: 23, mins: 159, km: 47.2, marginPct: 26.28, courier: 'Unassigned', color: '#f59e0b' },
  { id: 'cw3',   area: 'CW3 8025', jobs: 12, mins: 92, km: 38.4, marginPct: 31.10, courier: 'Halsw', color: '#3b82f6' },
  { id: 'cw2',   area: 'CW2 7604, 7608', jobs: 24, mins: 183, km: 92.8, marginPct: 28.86, courier: 'Prebb', color: '#ef4444' },
];

export const mockRunsPickup: Run[] = [
  { id: 'PCK1', area: 'Auckland CBD + Newmarket return', jobs: 9, mins: 92, km: 41.5, marginPct: 24.5, courier: 'Sione T.', color: '#8b5cf6' },
  { id: 'PCK2', area: 'Penrose + Airport return', jobs: 5, mins: 47, km: 22.1, marginPct: 22.8, courier: 'Unassigned', color: '#a855f7' },
];

export const mockFleetsDelivery: Fleet[] = [
  { name: 'Truck Channel' }, { name: 'Main Channel' }, { name: 'City Channel' },
  { name: 'Map Plan Run' }, { name: 'Regional' }, { name: 'Auckland Cool' },
  { name: 'Halls' }, { name: 'Agent' },
];

export const mockFleetsPickup: Fleet[] = [
  { name: 'Pickup Express' }, { name: 'Depot Returns' }, { name: 'Agent' },
];

export const mockCouriersByFleet: Record<string, Courier[]> = {
  'Truck Channel': [
    { id: 'C-101', name: 'Sione T.', fleet: 'Truck Channel', status: 'on-run' },
    { id: 'C-102', name: 'Karen M.', fleet: 'Truck Channel', status: 'available' },
    { id: 'C-103', name: 'David L.', fleet: 'Truck Channel', status: 'available' },
  ],
  'Main Channel': [
    { id: 'C-201', name: 'Aroha W.', fleet: 'Main Channel', status: 'available' },
    { id: 'C-202', name: 'Hēmi P.', fleet: 'Main Channel', status: 'on-run' },
  ],
  'City Channel': [],
  'Map Plan Run': [],
  'Regional': [],
  'Auckland Cool': [],
  'Halls': [],
  'Agent': [],
  'Pickup Express': [
    { id: 'C-501', name: 'Tom K.', fleet: 'Pickup Express', status: 'available' },
    { id: 'C-502', name: 'Ngaire B.', fleet: 'Pickup Express', status: 'available' },
  ],
  'Depot Returns': [
    { id: 'C-601', name: 'Sam R.', fleet: 'Depot Returns', status: 'on-run' },
  ],
};

export const mockPolygons = [
  { id: 'PG-01', name: 'Auckland CBD Inner', points: 6, jobsLast30Days: 412, color: '#3bc7f4' },
  { id: 'PG-02', name: 'East Tamaki Industrial', points: 8, jobsLast30Days: 287, color: '#606DB4' },
  { id: 'PG-03', name: 'North Shore Medical Corridor', points: 7, jobsLast30Days: 198, color: '#10b981' },
  { id: 'PG-04', name: 'Airport Express Zone', points: 5, jobsLast30Days: 156, color: '#f59e0b' },
];

export interface RecurringRoute {
  id: string;
  name: string;
  frequency: string;
  timeWindow: string;
  avgJobs: number;
  lastBuilt: string;
  live: boolean;
  color: string;
  zips: string[];
}

export const mockRecurringRoutes: RecurringRoute[] = [
  { id: 'RR-101', name: 'Zimmer AM Med', frequency: 'Mon–Fri', timeWindow: '07:00–09:00', avgJobs: 8, lastBuilt: 'Yesterday 07:32', live: true, color: '#ef4444', zips: ['7604', '7608'] },
  { id: 'RR-102', name: 'Halswell Medical Loop', frequency: 'Mon–Fri', timeWindow: '06:30–08:30', avgJobs: 6, lastBuilt: 'Yesterday 07:30', live: true, color: '#3b82f6', zips: ['8025'] },
  { id: 'RR-103', name: 'Sumner / Akaroa Run', frequency: 'Tue, Thu', timeWindow: '10:00–14:00', avgJobs: 3, lastBuilt: '2 days ago 09:01', live: true, color: '#10b981', zips: ['8081', '7520'] },
  { id: 'RR-104', name: 'PM Rolleston / Springston', frequency: 'Daily', timeWindow: '12:30–14:30', avgJobs: 9, lastBuilt: 'Yesterday 12:30', live: true, color: '#f59e0b', zips: ['7614', '7616'] },
];

// Approximate zip polygons (mockup) keyed by Christchurch zip code
export const zipPolygons: Record<string, [number, number][]> = {
  '7604': [[-43.512, 172.388], [-43.510, 172.420], [-43.530, 172.422], [-43.534, 172.395], [-43.520, 172.380]],          // Prebbleton
  '7608': [[-43.628, 172.460], [-43.630, 172.500], [-43.655, 172.502], [-43.652, 172.470], [-43.640, 172.452]],          // Lincoln
  '8025': [[-43.538, 172.520], [-43.540, 172.572], [-43.572, 172.575], [-43.575, 172.545], [-43.560, 172.518]],          // Halswell
  '8081': [[-43.557, 172.740], [-43.555, 172.785], [-43.582, 172.785], [-43.585, 172.745], [-43.572, 172.735]],          // Sumner
  '7520': [[-43.792, 172.945], [-43.795, 172.995], [-43.815, 172.992], [-43.818, 172.955], [-43.808, 172.940]],          // Akaroa
  '7614': [[-43.580, 172.365], [-43.582, 172.410], [-43.603, 172.412], [-43.605, 172.378], [-43.595, 172.358]],          // Rolleston
  '7616': [[-43.660, 172.455], [-43.662, 172.498], [-43.685, 172.500], [-43.688, 172.465], [-43.675, 172.448]],          // Springston
};

export interface BuildDraft {
  id: string;
  name: string;
  type: 'delivery' | 'pickup' | 'mixed';
  jobs: number;
  state: 'in-progress' | 'awaiting-review' | 'queued-to-build';
  builtBy: 'dispatcher' | 'auto-build';
  updatedMinsAgo: number;
}

export const mockDrafts: BuildDraft[] = [
  { id: 'D-7701', name: 'Auckland CBD AM Med (draft)', type: 'delivery', jobs: 6, state: 'in-progress', builtBy: 'dispatcher', updatedMinsAgo: 4 },
  { id: 'D-7702', name: 'North Shore Diagnostics', type: 'delivery', jobs: 4, state: 'awaiting-review', builtBy: 'auto-build', updatedMinsAgo: 12 },
  { id: 'D-7703', name: 'Manukau Pharma Loop', type: 'delivery', jobs: 5, state: 'queued-to-build', builtBy: 'auto-build', updatedMinsAgo: 22 },
  { id: 'D-7704', name: 'PM Return Pickups (East)', type: 'pickup', jobs: 4, state: 'in-progress', builtBy: 'dispatcher', updatedMinsAgo: 1 },
];
