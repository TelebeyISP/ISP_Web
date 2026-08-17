/** Linked Telebey platform repositories and service URLs. */

export const APIGATE_REPO = 'https://github.com/TelebeyISP/ApiGate.git';
export const ROUTER_DASHBOARD_REPO = 'https://github.com/TelebeyISP/isp.router-dashboard.git';

/** Open5GS router dashboard (default dev port 9999). */
export const routerDashboardUrl =
  import.meta.env.VITE_ROUTER_DASHBOARD_URL?.replace(/\/$/, '') || 'http://localhost:9999';
