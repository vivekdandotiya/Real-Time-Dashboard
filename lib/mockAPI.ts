import { LogEvent, LogLevel } from './types';

const services = ['API Gateway', 'Database', 'Auth Service', 'Cache Layer', 'Load Balancer', 'Message Queue'];
const messages = {
  INFO: [
    'Request processed successfully',
    'Cache hit',
    'Connection established',
    'Data synced',
    'Health check passed',
  ],
  WARN: [
    'High memory usage detected',
    'Slow query detected',
    'Cache miss rate increasing',
    'Connection pool near capacity',
    'Rate limit approaching',
  ],
  ERROR: [
    'Database connection failed',
    'Request timeout',
    'Authentication failed',
    'Service unavailable',
    'Disk space low',
    'Memory leak detected',
  ],
};

let eventId = 0;

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomEvent(): LogEvent {
  const level: LogLevel = getRandomItem(['INFO', 'WARN', 'ERROR'] as LogLevel[]);
  const weight = Math.random();
  const actualLevel: LogLevel = weight < 0.6 ? 'INFO' : weight < 0.85 ? 'WARN' : 'ERROR';

  return {
    id: `evt-${++eventId}`,
    timestamp: new Date(),
    level: actualLevel,
    service: getRandomItem(services),
    message: getRandomItem(messages[actualLevel]),
    details: {
      duration: Math.floor(Math.random() * 1000),
      statusCode: actualLevel === 'INFO' ? 200 : actualLevel === 'WARN' ? 429 : 500,
    },
  };
}

export function generateMockEvents(count: number): LogEvent[] {
  return Array.from({ length: count }, () => generateRandomEvent());
}

export function getMetrics(events: LogEvent[]) {
  return {
    totalEvents: events.length,
    errorCount: events.filter((e) => e.level === 'ERROR').length,
    warningCount: events.filter((e) => e.level === 'WARN').length,
    infoCount: events.filter((e) => e.level === 'INFO').length,
  };
}
