import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';

let routeModule: any;

// Helper to lazily load the route module after mocks are in place
async function loadRouteModule() {
  // Dynamically import after mocks are configured
  routeModule = await import('../src/app/api/auth/[...nextauth]/route');
}

describe('Auth route (route.ts) - with mocked NextAuth flows (valid NEXTAUTH_URL)', () => {
  beforeAll(async () => {
    // Ensure clean module registry for each test suite
    vi.resetModules();
    process.env.NEXTAUTH_URL = 'http://localhost';
    // Mock NextAuth to provide a deterministic in-process handler
    vi.doMock('next-auth/next', () => {
      return {
        default: (options: any) => {
          const allowedProviders = ['google', 'github'];
          const handler = async (req: Request) => {
            // Misconfiguration guard (used by dedicated misconfig test when needed)
            if (!process.env.NEXTAUTH_URL) {
              return new Response(JSON.stringify({ error: 'NEXTAUTH_URL not configured' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
              });
            }

            const url = new URL(req.url);
            const path = url.pathname;
            const searchParams = url.searchParams;
            const method = req.method.toUpperCase();

            // Sign-in path
            if (path.endsWith('/signin')) {
              const provider = searchParams.get('provider');
              if (!provider) {
                return new Response(JSON.stringify({ error: 'Missing provider parameter', code: 'MISSING_PROVIDER' }), {
                  status: 400,
                  headers: { 'Content-Type': 'application/json' },
                });
              }
              if (!allowedProviders.includes(provider)) {
                return new Response(JSON.stringify({ error: 'Unknown provider', code: 'INVALID_PROVIDER', provider }), {
                  status: 400,
                  headers: { 'Content-Type': 'application/json' },
                });
              }
              return new Response(JSON.stringify({ ok: true, provider }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              });
            }

            // Callback path
            if (path.endsWith('/callback')) {
              const provider = searchParams.get('provider');
              if (!provider) {
                return new Response(JSON.stringify({ error: 'Missing provider parameter', code: 'MISSING_PROVIDER' }), {
                  status: 400,
                  headers: { 'Content-Type': 'application/json' },
                });
              }
              if (!allowedProviders.includes(provider)) {
                return new Response(JSON.stringify({ error: 'Unsupported provider', code: 'UNSUPPORTED_PROVIDER', provider }), {
                  status: 400,
                  headers: { 'Content-Type': 'application/json' },
                });
              }
              return new Response(JSON.stringify({ ok: true, provider }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              });
            }

            // Session path
            if (path.endsWith('/session')) {
              const userHeader = req.headers.get('X-User');
              if (userHeader) {
                const user = JSON.parse(userHeader);
                const expires = new Date().toISOString();
                return new Response(JSON.stringify({ user, expires }), {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' },
                });
              }
              return new Response(JSON.stringify({ error: 'Not authenticated' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
              });
            }

            // Fallback
            return new Response(JSON.stringify({ error: 'Not Found' }), {
              status: 404,
              headers: { 'Content-Type': 'application/json' },
            });
          };
          return handler;
        },
      };
    });

    await loadRouteModule();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('Unknown provider in sign-in request returns 400 with structured error', async () => {
    const req = new Request('http://localhost/api/auth/[...nextauth]/signin?provider=unknown', { method: 'GET' });
    const res = await routeModule.GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toMatchObject({ error: 'Unknown provider', code: 'INVALID_PROVIDER', provider: 'unknown' });
  });

  it('Callback with invalid provider returns 400', async () => {
    const req = new Request('http://localhost/api/auth/[...nextauth]/callback?provider=UnknownProvider', { method: 'GET' });
    const res = await routeModule.POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toMatchObject({ error: 'Unsupported provider', code: 'UNSUPPORTED_PROVIDER', provider: 'UnknownProvider' });
  });

  it('Missing provider param results in 400', async () => {
    const req = new Request('http://localhost/api/auth/[...nextauth]/signin', { method: 'GET' });
    const res = await routeModule.GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toMatchObject({ error: 'Missing provider parameter', code: 'MISSING_PROVIDER' });
  });

  it('Session retrieval for authenticated user returns 200 with session payload', async () => {
    const user = { id: 'u1', name: 'Alice', email: 'alice@example.com' };
    const req = new Request('http://localhost/api/auth/[...nextauth]/session', {
      method: 'GET',
      headers: { 'X-User': JSON.stringify(user) },
    });
    const res = await routeModule.GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ user, expires: expect.any(String) });
  });

  it('Session retrieval for unauthenticated user returns 401', async () => {
    const req = new Request('http://localhost/api/auth/[...nextauth]/session', { method: 'GET' });
    const res = await routeModule.GET(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toMatchObject({ error: 'Not authenticated' });
  });
});

// Separate suite to verify misconfiguration behavior (NEXTAUTH_URL missing)
describe('Auth route - misconfigured environment (NEXTAUTH_URL missing)', () => {
  beforeAll(async () => {
    vi.resetModules();
    process.env.NEXTAUTH_URL = undefined; // simulate misconfiguration

    vi.doMock('next-auth/next', () => {
      return {
        default: () => {
          // Always return 500 if NEXTAUTH_URL is not configured
          const handler = async (_req: Request) => {
            if (!process.env.NEXTAUTH_URL) {
              return new Response(JSON.stringify({ error: 'NEXTAUTH_URL not configured' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
              });
            }
            return new Response(JSON.stringify({ ok: true }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            });
          };
          return handler;
        },
      };
    });

    await loadRouteModule();
  });

  afterAll(() => {
    vi.resetModules();
  });

  it('Signin attempt returns 500 when NEXTAUTH_URL is missing', async () => {
    const req = new Request('http://localhost/api/auth/[...nextauth]/signin?provider=google', { method: 'GET' });
    const res = await routeModule.GET(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toMatchObject({ error: 'NEXTAUTH_URL not configured' });
  });
});
