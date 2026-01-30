export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export interface LogEvent {
  id: string;
  timestamp: Date;
  level: LogLevel;
  service: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface Metrics {
  totalEvents: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
}
