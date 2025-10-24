
export const SNAPSHOT_CATEGORIES = {
  files: "File System",
  registry: "Registry",
  processes: "Processes",
  services: "Services",
  drivers: "Drivers",
  netstat: "Network Connections",
} as const;

export type SnapshotFileCategory = keyof typeof SNAPSHOT_CATEGORIES;

export interface SnapshotFile {
  name: string;
  content: string;
}

export type SnapshotData = Partial<Record<SnapshotFileCategory, SnapshotFile>>;

export interface Snapshot {
  id: string;
  name: string;
  createdAt: Date;
  data: SnapshotData;
}

export type ComparisonResult = Partial<Record<SnapshotFileCategory, string>>;

export type AppView = 'instructions' | 'upload' | 'comparison';
