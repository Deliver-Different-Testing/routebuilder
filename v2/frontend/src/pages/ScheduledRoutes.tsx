import CockpitPage from '../components/CockpitPage';
import {
  mockJobs, mockGroupsDelivery, mockRunsDelivery, mockFleetsDelivery,
  mockRecurringRoutes, zipPolygons,
} from '../lib/mockData';

export default function ScheduledRoutes() {
  return (
    <CockpitPage
      title="Scheduled Routes"
      subtitle="The cockpit's top-left panel is the scheduled-routes board — tick a route to highlight its zip polygons on the map and filter the Jobs List to jobs in those zips."
      jobs={mockJobs}
      groups={mockGroupsDelivery}
      runs={mockRunsDelivery}
      fleets={mockFleetsDelivery}
      mapCenter={[-43.56, 172.50]}
      mapZoom={11}
      regularRoutes={mockRecurringRoutes}
      zipPolygons={zipPolygons}
    />
  );
}
