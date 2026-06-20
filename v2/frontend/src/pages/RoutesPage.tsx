import { useEffect, useState } from 'react';
import CockpitPage from '../components/CockpitPage';
import { fetchJobs, fetchRuns, fetchFleets, fetchJobGroups } from '../lib/api';
import { mockJobs, mockGroupsDelivery, mockRunsDelivery, mockFleetsDelivery } from '../lib/mockData';
import type { Job, JobGroup, Run, Fleet } from '../lib/mockData';

/**
 * Routes — wired to the .NET 9 backend via /api endpoints.
 *
 * Falls back to mock data while the backend is unreachable so the cockpit still
 * renders in the demo. Once `/api/jobs` returns 200, the mocks are replaced.
 *
 * Pattern Kevin should follow for Quoting + ScheduledRoutes:
 *   1. useState({ live: false }) so a loading state is visible.
 *   2. useEffect to fetch + setState.
 *   3. catch blocks fall back to mock + console.warn.
 */
export default function RoutesPage() {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [groups, setGroups] = useState<JobGroup[]>(mockGroupsDelivery);
  const [runs, setRuns] = useState<Run[]>(mockRunsDelivery);
  const [fleets, setFleets] = useState<Fleet[]>(mockFleetsDelivery);
  const [live, setLive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date();
    let cancelled = false;
    (async () => {
      try {
        const [jobsResp, groupsResp, runsResp, fleetsResp] = await Promise.all([
          fetchJobs({ date: today }),
          fetchJobGroups(today),
          fetchRuns(today),
          fetchFleets(),
        ]);
        if (cancelled) return;
        if (jobsResp.length > 0)   setJobs(jobsResp);
        if (groupsResp.length > 0) setGroups(groupsResp);
        if (runsResp.length > 0)   setRuns(runsResp);
        if (fleetsResp.length > 0) setFleets(fleetsResp);
        setLive(true);
      } catch (e) {
        console.warn('Routes API unreachable — falling back to mock data', e);
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      {!live && error && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-1 text-[11px] text-amber-800">
          ⚠️ Live API unavailable — showing mock data for demo. {error}
        </div>
      )}
      <CockpitPage
        title="Routes"
        subtitle={live ? 'Live data from /api/* — pickups auto-match by zip.' : 'Mockup mode — backend not wired in this environment.'}
        jobs={jobs}
        groups={groups}
        runs={runs}
        fleets={fleets}
        mapCenter={[-43.56, 172.50]}
        mapZoom={11}
      />
    </>
  );
}
