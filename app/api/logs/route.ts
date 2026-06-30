import { NextResponse } from 'next/server';

interface LogEvent {
  id: string;
  timestamp: string;
  websiteId: string;
  level: string;
  service: string;
  message: string;
  details?: any;
}

// Extend global to store logs persistently in dev mode across hot-reloads
const globalRef = globalThis as any;
if (!globalRef.logsRegistry) {
  globalRef.logsRegistry = [];
}
if (!globalRef.logCounter) {
  globalRef.logCounter = 0;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function pruneOldLogs() {
  const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
  globalRef.logsRegistry = (globalRef.logsRegistry || []).filter(
    (log: LogEvent) => new Date(log.timestamp).getTime() > twentyFourHoursAgo
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(request: Request) {
  pruneOldLogs();
  
  const { searchParams } = new URL(request.url);
  const websiteId = searchParams.get('websiteId');

  if (!websiteId) {
    return NextResponse.json(
      { error: 'websiteId query parameter is required' },
      { status: 400, headers: corsHeaders }
    );
  }

  // Filter logs for the specific website, sorted by timestamp descending (newest first)
  const filtered = (globalRef.logsRegistry || [])
    .filter((log: LogEvent) => log.websiteId === websiteId)
    .sort((a: LogEvent, b: LogEvent) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return NextResponse.json(filtered, { headers: corsHeaders });
}

export async function POST(request: Request) {
  pruneOldLogs();

  try {
    const body = await request.json();
    const { websiteId, level, service, message, details } = body;

    if (!websiteId) {
      return NextResponse.json(
        { error: 'websiteId is required in the request body' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!message) {
      return NextResponse.json(
        { error: 'message is required in the request body' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Increment counter
    globalRef.logCounter = (globalRef.logCounter || 0) + 1;

    const newLog: LogEvent = {
      id: `evt-${globalRef.logCounter}`,
      timestamp: new Date().toISOString(),
      websiteId,
      level: (level || 'INFO').toUpperCase(),
      service: service || 'Client Site',
      message,
      details: details || {},
    };

    globalRef.logsRegistry.push(newLog);

    return NextResponse.json(newLog, { status: 201, headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON payload' },
      { status: 400, headers: corsHeaders }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const websiteId = searchParams.get('websiteId');

  if (!websiteId) {
    return NextResponse.json(
      { error: 'websiteId query parameter is required' },
      { status: 400, headers: corsHeaders }
    );
  }

  // Clear all logs matching this websiteId
  globalRef.logsRegistry = (globalRef.logsRegistry || []).filter(
    (log: LogEvent) => log.websiteId !== websiteId
  );

  return NextResponse.json({ success: true }, { headers: corsHeaders });
}
