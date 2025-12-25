import http from 'http';
import os from 'os';
import { URL } from 'url';

const STARTED_AT = Date.now();
const PORT = Number(process.env.PORT || 5000);
const HOST = process.env.HOST || '0.0.0.0';
const MAX_INFLIGHT = Number(process.env.MAX_INFLIGHT || 250);
const REQUEST_TIMEOUT = Number(process.env.REQUEST_TIMEOUT || 30000);

let inflight = 0;
let shuttingDown = false;

const server = http.createServer((req, res) => {
  const url = buildUrl(req);

  applyCors(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (shuttingDown) {
    return sendJson(res, 503, { status: 'shutting-down' });
  }

  if (inflight >= MAX_INFLIGHT) {
    return sendJson(res, 503, {
      status: 'backpressure',
      message: 'Server is at capacity, please retry shortly'
    }, { 'Retry-After': '2' });
  }

  inflight++;
  res.on('finish', () => {
    inflight = Math.max(0, inflight - 1);
  });

  if (req.method === 'GET' && url.pathname === '/api/health') {
    return sendJson(res, 200, {
      status: 'ok',
      uptimeMs: Date.now() - STARTED_AT,
      timestamp: new Date().toISOString()
    });
  }

  if (req.method === 'GET' && url.pathname === '/api/readiness') {
    return sendJson(res, 200, readinessSnapshot());
  }

  if (req.method === 'GET' && url.pathname === '/api/status') {
    return sendJson(res, 200, statusSnapshot());
  }

  sendJson(res, 404, { status: 'not-found', path: url.pathname });
});

server.keepAliveTimeout = 75_000;
server.headersTimeout = 80_000;
server.requestTimeout = REQUEST_TIMEOUT;

server.listen(PORT, HOST, () => {
  console.log(`Backend listening on http://${HOST}:${PORT}`);
});

const stopServer = (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`Received ${signal}; draining connections...`);
  server.close(() => {
    console.log('All connections closed, exiting');
    process.exit(0);
  });

  setTimeout(() => {
    console.warn('Forcing shutdown after timeout');
    process.exit(1);
  }, REQUEST_TIMEOUT).unref();
};

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => stopServer(signal));
});

function sendJson(res, status, body, extraHeaders = {}) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
    ...extraHeaders
  });
  res.end(payload);
}

function readinessSnapshot() {
  const memory = process.memoryUsage();
  const load = os.loadavg();
  return {
    status: 'ready',
    inflight,
    maxInflight: MAX_INFLIGHT,
    uptimeMs: Date.now() - STARTED_AT,
    memory: {
      rss: memory.rss,
      heapUsed: memory.heapUsed
    },
    load1: load[0],
    load5: load[1],
    load15: load[2]
  };
}

function statusSnapshot() {
  return {
    status: 'ok',
    inflight,
    uptimeMs: Date.now() - STARTED_AT,
    pid: process.pid,
    hostname: os.hostname(),
    cpuCount: os.cpus().length
  };
}

function applyCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-OrgUrl,X-PAT,X-Project');
}

function buildUrl(req) {
  try {
    const origin = req.headers.host ? `http://${req.headers.host}` : 'http://localhost';
    return new URL(req.url || '/', origin);
  } catch {
    return new URL('http://localhost');
  }
}
