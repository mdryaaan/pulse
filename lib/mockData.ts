import { EPOCH_ANCHOR, hashSeed, makeRng, pick, randomInt } from './simulate';
import type {
  Alert,
  Cluster,
  Deployment,
  DeployStatus,
  LogLevel,
  LogLine,
  Node,
  PodInstance,
  RolloutEvent,
  Severity,
  Status,
} from './types';

/*
 * Every generator here is seeded, so the whole dataset is identical on the
 * server and in the browser. See lib/simulate.ts for why that matters.
 */

const ENVIRONMENTS = ['production', 'staging', 'dev', 'canary'] as const;

const REGIONS = [
  { id: 'us-east-1', label: 'us-east-1', provider: 'aws' as const },
  { id: 'us-west-2', label: 'us-west-2', provider: 'aws' as const },
  { id: 'eu-west-1', label: 'eu-west-1', provider: 'aws' as const },
  { id: 'eu-central-1', label: 'eu-central-1', provider: 'aws' as const },
  { id: 'ap-south-1', label: 'ap-south-1', provider: 'aws' as const },
  { id: 'ap-southeast-2', label: 'ap-southeast-2', provider: 'aws' as const },
  { id: 'us-central1', label: 'us-central1', provider: 'gcp' as const },
  { id: 'europe-west4', label: 'europe-west4', provider: 'gcp' as const },
  { id: 'northeurope', label: 'northeurope', provider: 'azure' as const },
];

const SERVICES = [
  'api-gateway',
  'auth-service',
  'payment-processor',
  'notification-worker',
  'search-indexer',
  'media-transcoder',
  'billing-reconciler',
  'session-store',
  'webhook-dispatcher',
  'report-generator',
  'fraud-detector',
  'inventory-sync',
  'email-relay',
  'analytics-collector',
];

const K8S_VERSIONS = ['v1.31.4', 'v1.31.2', 'v1.30.8', 'v1.30.6', 'v1.29.11'];

const ENGINEERS = ['a.okafor', 'm.lindqvist', 'r.tanaka', 's.mehta', 'j.whitfield', 'ci-bot'];

/** Short hex suffix, the way Kubernetes names replica pods. */
function hex(rng: () => number, length: number): string {
  const chars = 'abcdef0123456789';
  let out = '';
  for (let i = 0; i < length; i += 1) out += chars[Math.floor(rng() * chars.length)];
  return out;
}

function statusFrom(rng: () => number, environment: string): Status {
  // Production is kept healthier than dev, which is what a real fleet looks like.
  const roll = rng();
  if (environment === 'production') return roll > 0.92 ? 'degraded' : 'healthy';
  if (environment === 'dev') {
    if (roll > 0.9) return 'down';
    return roll > 0.72 ? 'degraded' : 'healthy';
  }
  return roll > 0.82 ? 'degraded' : 'healthy';
}

function makeNodes(rng: () => number, clusterName: string, count: number): Node[] {
  return Array.from({ length: count }, (_, index) => {
    const status: Status = rng() > 0.94 ? 'degraded' : rng() > 0.99 ? 'down' : 'healthy';
    return {
      id: `${clusterName}-node-${index + 1}`,
      name: `ip-10-${randomInt(rng, 0, 255)}-${randomInt(rng, 0, 255)}-${randomInt(rng, 0, 255)}`,
      status,
      cpu: Number((22 + rng() * 62).toFixed(1)),
      memory: Number((30 + rng() * 55).toFixed(1)),
      pods: randomInt(rng, 8, 42),
      kubelet: pick(rng, K8S_VERSIONS),
    };
  });
}

let clustersCache: Cluster[] | null = null;

export function getClusters(): Cluster[] {
  if (clustersCache) return clustersCache;

  const rng = makeRng(hashSeed('pulse:clusters:v1'));
  const clusters: Cluster[] = [];

  for (const environment of ENVIRONMENTS) {
    const regionCount = environment === 'production' ? 5 : environment === 'staging' ? 4 : 3;
    for (let i = 0; i < regionCount; i += 1) {
      const region = REGIONS[(clusters.length * 3 + i) % REGIONS.length]!;
      const name = `${environment}-${region.label}`;
      if (clusters.some((c) => c.name === name)) continue;

      const status = statusFrom(rng, environment);
      const nodeCount =
        environment === 'production' ? randomInt(rng, 6, 18) : randomInt(rng, 2, 8);
      const nodeList = makeNodes(rng, name, nodeCount);

      clusters.push({
        id: name,
        name,
        region: region.label,
        provider: region.provider,
        status,
        nodes: nodeCount,
        pods: nodeList.reduce((sum, node) => sum + node.pods, 0),
        cpu: Number(
          (nodeList.reduce((s, n) => s + n.cpu, 0) / Math.max(nodeList.length, 1)).toFixed(1),
        ),
        memory: Number(
          (nodeList.reduce((s, n) => s + n.memory, 0) / Math.max(nodeList.length, 1)).toFixed(
            1,
          ),
        ),
        version: pick(rng, K8S_VERSIONS),
        updatedAt: EPOCH_ANCHOR - randomInt(rng, 5, 900) * 1000,
        nodeList,
      });
    }
  }

  clustersCache = clusters;
  return clusters;
}

export function getCluster(id: string): Cluster | undefined {
  return getClusters().find((cluster) => cluster.id === id);
}

function makePods(
  rng: () => number,
  service: string,
  desired: number,
  nodes: Node[],
): PodInstance[] {
  return Array.from({ length: desired }, () => {
    const roll = rng();
    const status: PodInstance['status'] =
      roll > 0.96 ? 'CrashLoopBackOff' : roll > 0.92 ? 'Pending' : 'Running';
    return {
      name: `${service}-${hex(rng, 5)}-${hex(rng, 5)}`,
      status,
      restarts: status === 'CrashLoopBackOff' ? randomInt(rng, 3, 27) : randomInt(rng, 0, 2),
      age: `${randomInt(rng, 1, 21)}d`,
      node: nodes.length ? pick(rng, nodes).name : 'ip-10-0-0-1',
    };
  });
}

function makeHistory(
  rng: () => number,
  service: string,
  current: DeployStatus,
): RolloutEvent[] {
  const revisions = randomInt(rng, 3, 6);
  return Array.from({ length: revisions }, (_, index) => {
    const revision = revisions - index;
    const isCurrent = index === 0;
    return {
      revision,
      image: `ghcr.io/acme/${service}:1.${randomInt(rng, 4, 28)}.${randomInt(rng, 0, 9)}`,
      at: EPOCH_ANCHOR - (index * randomInt(rng, 6, 72) + 2) * 3600_000,
      status: isCurrent ? current : rng() > 0.85 ? 'rolled-back' : 'succeeded',
      by: pick(rng, ENGINEERS),
    };
  });
}

let deploymentsCache: Deployment[] | null = null;

export function getDeployments(): Deployment[] {
  if (deploymentsCache) return deploymentsCache;

  const rng = makeRng(hashSeed('pulse:deployments:v1'));
  const clusters = getClusters();
  const out: Deployment[] = [];

  for (const cluster of clusters) {
    const count = cluster.name.startsWith('production')
      ? randomInt(rng, 4, 7)
      : randomInt(rng, 2, 5);
    const used = new Set<string>();

    for (let i = 0; i < count; i += 1) {
      const service = pick(rng, SERVICES);
      if (used.has(service)) continue;
      used.add(service);

      const roll = rng();
      const status: DeployStatus =
        roll > 0.94
          ? 'failed'
          : roll > 0.86
            ? 'deploying'
            : roll > 0.82
              ? 'rolled-back'
              : 'succeeded';

      const desired = randomInt(rng, 2, 8);
      const ready =
        status === 'succeeded' ? desired : randomInt(rng, 0, Math.max(desired - 1, 0));
      const tag = `1.${randomInt(rng, 4, 28)}.${randomInt(rng, 0, 9)}`;

      out.push({
        id: `${cluster.id}/${service}`,
        name: service,
        clusterId: cluster.id,
        clusterName: cluster.name,
        status,
        replicasReady: ready,
        replicasDesired: desired,
        image: `ghcr.io/acme/${service}`,
        tag,
        deployedAt: EPOCH_ANCHOR - randomInt(rng, 3, 2200) * 60_000,
        pods: makePods(rng, service, desired, cluster.nodeList),
        history: makeHistory(rng, service, status),
      });
    }
  }

  deploymentsCache = out;
  return out;
}

const ALERT_TEMPLATES: {
  severity: Severity;
  title: string;
  description: (resource: string) => string;
  runbook: string;
}[] = [
  {
    severity: 'critical',
    title: 'Pod CrashLoopBackOff',
    description: (r) =>
      `${r} has restarted 14 times in the last 20 minutes. The container exits with code 137 shortly after the readiness probe passes.`,
    runbook: 'runbooks/crashloop',
  },
  {
    severity: 'critical',
    title: 'Node NotReady',
    description: (r) =>
      `${r} stopped reporting to the API server 6 minutes ago. Workloads are being rescheduled onto the remaining nodes.`,
    runbook: 'runbooks/node-notready',
  },
  {
    severity: 'critical',
    title: 'Persistent volume claim pending',
    description: (r) =>
      `${r} has been Pending for 12 minutes. No PersistentVolume matches the requested ReadWriteOnce access mode in this zone.`,
    runbook: 'runbooks/pvc-pending',
  },
  {
    severity: 'warning',
    title: 'Memory pressure on node',
    description: (r) =>
      `${r} is at 91% memory utilisation and the kubelet has begun evicting BestEffort pods.`,
    runbook: 'runbooks/memory-pressure',
  },
  {
    severity: 'warning',
    title: 'Rollout stalled',
    description: (r) =>
      `${r} has not progressed past 2 of 5 replicas for 9 minutes. New pods are failing their readiness probe.`,
    runbook: 'runbooks/stalled-rollout',
  },
  {
    severity: 'warning',
    title: 'Certificate expiring',
    description: (r) =>
      `The TLS certificate served by ${r} expires in 9 days. Automatic renewal last failed at 03:14 UTC.`,
    runbook: 'runbooks/cert-renewal',
  },
  {
    severity: 'warning',
    title: 'API server latency elevated',
    description: (r) =>
      `p99 request latency on ${r} has exceeded 1.2s for 15 minutes, up from a 240ms baseline.`,
    runbook: 'runbooks/apiserver-latency',
  },
  {
    severity: 'info',
    title: 'Autoscaler added nodes',
    description: (r) =>
      `The cluster autoscaler added 2 nodes to ${r} in response to unschedulable pods.`,
    runbook: 'runbooks/autoscaling',
  },
  {
    severity: 'info',
    title: 'Deployment succeeded',
    description: (r) => `${r} completed a rolling update with zero unavailable replicas.`,
    runbook: 'runbooks/deployments',
  },
  {
    severity: 'info',
    title: 'Image garbage collection',
    description: (r) =>
      `${r} reclaimed 8.4 GiB by removing unreferenced images above the high-watermark threshold.`,
    runbook: 'runbooks/image-gc',
  },
];

let alertsCache: Alert[] | null = null;

export function getAlerts(): Alert[] {
  if (alertsCache) return alertsCache;

  const rng = makeRng(hashSeed('pulse:alerts:v1'));
  const clusters = getClusters();
  const deployments = getDeployments();
  const out: Alert[] = [];

  for (let i = 0; i < 26; i += 1) {
    const template = pick(rng, ALERT_TEMPLATES);
    const cluster = pick(rng, clusters);
    const deployment = pick(
      rng,
      deployments.filter((d) => d.clusterId === cluster.id),
    );

    const resource = template.title.includes('Node')
      ? (cluster.nodeList[0]?.name ?? 'ip-10-0-0-1')
      : deployment
        ? `${deployment.name}-${hex(rng, 5)}`
        : 'api-gateway-7d9f8';

    out.push({
      id: `alert-${i + 1}`,
      severity: template.severity,
      title: template.title,
      description: template.description(resource),
      resource,
      clusterName: cluster.name,
      at: EPOCH_ANCHOR - randomInt(rng, 2, 2880) * 60_000,
      // Older alerts are more likely to already be resolved.
      resolved: rng() > 0.72,
      runbook: template.runbook,
    });
  }

  alertsCache = out.sort((a, b) => b.at - a.at);
  return alertsCache;
}

const LOG_TEMPLATES: {
  level: LogLevel;
  weight: number;
  make: (rng: () => number, s: string) => string;
}[] = [
  {
    level: 'INFO',
    weight: 46,
    make: (r, s) => `Health check passed for pod ${s}-${hex(r, 5)} in 12ms`,
  },
  {
    level: 'INFO',
    weight: 12,
    make: (r, s) => `Scaled deployment ${s} to ${randomInt(r, 2, 9)} replicas`,
  },
  { level: 'INFO', weight: 10, make: (r, s) => `Reconciled ${s}: no drift detected` },
  {
    level: 'DEBUG',
    weight: 10,
    make: (r, s) => `Cache hit ratio for ${s} at ${(88 + r() * 11).toFixed(1)}%`,
  },
  {
    level: 'DEBUG',
    weight: 6,
    make: (r, s) => `Lease renewed for ${s} controller (holder ${hex(r, 8)})`,
  },
  {
    level: 'WARN',
    weight: 9,
    make: (r) =>
      `High memory usage detected on node-${randomInt(r, 1, 12)} (${(87 + r() * 10).toFixed(1)}%)`,
  },
  {
    level: 'WARN',
    weight: 4,
    make: (r, s) => `Readiness probe for ${s}-${hex(r, 5)} failed: HTTP 503`,
  },
  {
    level: 'ERROR',
    weight: 2,
    make: () =>
      `Connection timeout to database replica db-ro-${randomInt(makeRng(7), 1, 3)} after 5000ms`,
  },
  {
    level: 'ERROR',
    weight: 1,
    make: (r, s) => `Failed to pull image for ${s}: manifest unknown`,
  },
];

const WEIGHT_TOTAL = LOG_TEMPLATES.reduce((sum, t) => sum + t.weight, 0);

/** One log line, drawn from a weighted mix so ERRORs stay rare and legible. */
export function makeLogLine(rng: () => number, at: number, clusterName: string): LogLine {
  let roll = rng() * WEIGHT_TOTAL;
  let chosen = LOG_TEMPLATES[0]!;
  for (const template of LOG_TEMPLATES) {
    roll -= template.weight;
    if (roll <= 0) {
      chosen = template;
      break;
    }
  }

  const service = pick(rng, SERVICES);
  return {
    id: `${at}-${hex(rng, 6)}`,
    at,
    level: chosen.level,
    source: `${clusterName.split('-')[0]}/${service}`,
    message: chosen.make(rng, service),
  };
}

/** A backfilled buffer so the log panel is never empty on first paint. */
export function seedLogs(clusterName: string, count = 24): LogLine[] {
  const rng = makeRng(hashSeed(`pulse:logs:${clusterName}`));
  return Array.from({ length: count }, (_, i) =>
    makeLogLine(rng, EPOCH_ANCHOR - (count - i) * 3200, clusterName),
  );
}

export { SERVICES, ENGINEERS };
