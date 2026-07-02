export type Status = 'healthy' | 'degraded' | 'down';
export type Severity = 'critical' | 'warning' | 'info';
export type DeployStatus = 'succeeded' | 'deploying' | 'failed' | 'rolled-back';
export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
export type TimeRange = '1h' | '6h' | '24h' | '7d';

/** One point on a metric series. `t` is an epoch millisecond timestamp. */
export interface Point {
  t: number;
  v: number;
}

export interface Node {
  id: string;
  name: string;
  status: Status;
  cpu: number;
  memory: number;
  pods: number;
  kubelet: string;
}

export interface Cluster {
  id: string;
  name: string;
  region: string;
  provider: 'aws' | 'gcp' | 'azure';
  status: Status;
  nodes: number;
  pods: number;
  cpu: number;
  memory: number;
  version: string;
  /** Epoch ms of the last heartbeat. */
  updatedAt: number;
  nodeList: Node[];
}

export interface PodInstance {
  name: string;
  status: 'Running' | 'Pending' | 'CrashLoopBackOff' | 'Terminating';
  restarts: number;
  age: string;
  node: string;
}

export interface RolloutEvent {
  revision: number;
  image: string;
  at: number;
  status: DeployStatus;
  by: string;
}

export interface Deployment {
  id: string;
  name: string;
  clusterId: string;
  clusterName: string;
  status: DeployStatus;
  replicasReady: number;
  replicasDesired: number;
  image: string;
  tag: string;
  deployedAt: number;
  pods: PodInstance[];
  history: RolloutEvent[];
}

export interface Alert {
  id: string;
  severity: Severity;
  title: string;
  description: string;
  resource: string;
  clusterName: string;
  at: number;
  resolved: boolean;
  runbook: string;
}

export interface LogLine {
  id: string;
  at: number;
  level: LogLevel;
  source: string;
  message: string;
}

/** The live, mutating slice of state shown on the overview cards. */
export interface LiveMetrics {
  uptime: number;
  clusters: number;
  pods: number;
  cpu: number;
  memory: number;
  /** Percentage-point change versus the previous window. */
  deltas: { uptime: number; clusters: number; pods: number; cpu: number; memory: number };
  series: { cpu: Point[]; memory: Point[]; network: Point[] };
}
