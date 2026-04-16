import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock NextAuth to simulate a simple in-memory flow for a mocked provider named 'mock'.
vi.mock('next-auth/next', () => {
  // Simple in-memory store to simulate sessions across requests
  const store = {
    lastState: 0,
    lastToken: 0,
    // token -> user
    sessions: new Map<string, any>(),
  } as const;

  // Handler factory returns a request handler function
  const handlerFactory = (_options: any) => {
    // The actual handler performs very small, deterministic flows for testing.
    const handler = async (req: Request) => {
      const url = new URL(req.url);
      const method = (req.method || 'GET').toUpperCase();
      const path = url.pathname;

      // Sign-in with mock provider
      if (path === '/api/auth/signin') {
        if (method !== 'GET') {
          return new Response('Method Not Allowed', { status: 405 });
        }
        const provider = url.searchParams.get('provider');
        if (!provider || provider === 'invalid') {
          const body = JSON.stringify({ error: 'Unknown provider' });
          return new Response(body, {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        if (provider === 'mock') {
          // deterministically generate a state
          store.lastState += 1;
          const state = `state_${store.lastState}`;
          const headers = new Headers();
          // Simulate redirect to internal callback URL in test harness
          headers.set(
            'Location',
            `/api/auth/callback/mock?state=${state}&code=mockCode`
          );
          // Expose the state cookie for deterministic testing
          headers.set('Set-Cookie', `next-auth.state=${state}; Path=/; HttpOnly`);
          return new Response(null, {
            status: 302,
            headers,
          });
        }
        // Fallback error
        return new Response(JSON.stringify({ error: 'Unknown provider' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Callback for mock provider
      if (path === '/api/auth/callback/mock') {
        if (method !== 'GET') return new Response('Method Not Allowed', { status: 405 });
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        if (url.searchParams.get('error')) {
          const err = url.searchParams.get('error');
          return new Response(JSON.stringify({ error: err }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        if (code && state) {
          // Create a session token and store a user
          store.lastToken += 1;
          const token = `token_${store.lastToken}`;
          const user = { id: 'mock-id', name: 'Mock User', email: 'mock@example.com' };
          store.sessions.set(token, user);
          const headers = new Headers();
          headers.set('Content-Type', 'application/json');
          headers.set('Set-Cookie', `next-auth.session-token=${token}; Path=/; HttpOnly`);
          headers.set('x-auth-token', token); // test-friendly token propagation
          return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers,
          });
        }
        return new Response(JSON.stringify({ error: 'Invalid callback' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Retrieve session
      if (path === '/api/auth/session') {
        const cookieHeader = (req.headers.get && req.headers.get('cookie')) || '';
        let token: string | undefined;
        const m = /next-auth.session-token=([^;]+)/.exec(cookieHeader);
        if (m) token = m[1];
        if (token && store.sessions.has(token)) {
          const user = store.sessions.get(token);
          return new Response(JSON.stringify({ user }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify({ user: null, expires: null }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Sign-out
      if (path === '/api/auth/signout') {
        if (method !== 'POST') return new Response(null, { status: 405 });
        // Enforce CSRF-like check
        const csrf = (req.headers.get && req.headers.get('x-csrf-token')) || '';
        if (!csrf) {
          return new Response(null, { status: 403 });
        }
        // Clear sessions and cookie
        store.sessions.clear();
        const headers = new Headers();
        headers.set('Location', '/');
        headers.set('Set-Cookie', 'next-auth.session-token=; Max-Age=0; Path=/');
        return new Response(null, { status: 302, headers });
      }

      // Not found for other routes in this mock
      return new Response('Not Found', { status: 404 });
    };
    return handler;
  };

  return {
    default: (options: any) => handlerFactory(options),
  } as any;
});

// Import the route using the mocked NextAuth
// The route exports GET and POST handlers which are the same in this app-router setup
import { GET, POST } from '../../../src/app/api/auth/[...nextauth]/route';

// Helper to read JSON from responses safely
async function readJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { text };
  }
}

describe('NextAuth route integration (mock provider)', () => {
  beforeEach(() => {
    // no-op, kept for potential future per-test resets
  });

  it('sign-in with mock provider yields a 302 redirect to internal callback with state', async () => {
    const req = new Request('/api/auth/signin?provider=mock', { method: 'GET' });
    const res = await GET(req);
    expect(res.status).toBe(302);
    const location = res.headers.get('location') || res.headers.get('Location');
    expect(typeof location).toBe('string');
    expect(location).toContain('/api/auth/callback/mock?state=state_');
    // Ensure a Set-Cookie for the state is present (deterministic)
    const setCookie = res.headers.get('set-cookie');
    expect(typeof setCookie).toBe('string');
    expect(setCookie).toContain('next-auth.state=state_');
  });

  it('sign-in -> callback -> establish session and retrieve it via session endpoint', async () => {
    // Step 1: sign-in to get into callback flow
    const signinReq = new Request('/api/auth/signin?provider=mock', { method: 'GET' });
    const signinRes = await GET(signinReq);
    expect(signinRes.status).toBe(302);
    const location = signinRes.headers.get('location') || signinRes.headers.get('Location');
    expect(typeof location).toBe('string');

    // Extract state from Location
    const mState = /state=([^&]+)/.exec(location || '');
    const state = mState ? mState[1] : 'state_1';

    // Step 2: callback with code/state
    const cbReq = new Request(`/api/auth/callback/mock?state=${state}&code=mockCode`, {
      method: 'GET',
    });
    const cbRes = await GET(cbReq);
    expect(cbRes.status).toBe(200);

    // Read token from Set-Cookie or header
    const setCookie = cbRes.headers.get('set-cookie');
    let token: string | undefined;
    if (setCookie) {
      const m = /next-auth.session-token=([^;]+)/.exec(setCookie);
      if (m) token = m[1];
    }
    const tokenHeader = cbRes.headers.get('x-auth-token');
    if (tokenHeader) token = tokenHeader;
    expect(token).toBeTruthy();

    // Step 3: retrieve session with cookie
    const sessionCookie = `next-auth.session-token=${token}`;
    const sessionReq = new Request('/api/auth/session', {
      method: 'GET',
      headers: new Headers({ Cookie: sessionCookie }),
    });
    const sessionRes = await GET(sessionReq);
    expect(sessionRes.status).toBe(200);
    const data = await readJson(sessionRes);
    expect(data).toHaveProperty('user');
    expect(data.user).toBeTruthy();
    expect(data.user.id).toBe('mock-id');
    expect(data.user.name).toBe('Mock User');
    expect(data.user.email).toBe('mock@example.com');
  });

  it('sign-out clears the session and unauthenticates thereafter', async () => {
    // First, perform sign-in to establish a session
    const signinRes = await GET(new Request('/api/auth/signin?provider=mock', { method: 'GET' }));
    const loc = signinRes.headers.get('location') || signinRes.headers.get('Location');
    const state = /state=([^&]+)/.exec(loc || '')?.[1] ?? 'state_1';
    const cbRes = await GET(new Request(`/api/auth/callback/mock?state=${state}&code=mockCode`, { method: 'GET' }));
    const setCookie = cbRes.headers.get('set-cookie');
    let token: string | undefined;
    if (setCookie) {
      const m = /next-auth.session-token=([^;]+)/.exec(setCookie);
      if (m) token = m[1];
    }
    const sessionCookie = `next-auth.session-token=${token}`;

    // Sign-out with CSRF token
    const signoutReq = new Request('/api/auth/signout', {
      method: 'POST',
      headers: new Headers({ 'X-CSRF-TOKEN': 'tok' }),
    });
    const signoutRes = await POST(signoutReq);
    expect(signoutRes.status).toBe(302);

    // Check that the cookie is cleared
    const signoutCookie = signoutRes.headers.get('set-cookie') || '';
    expect(signoutCookie).toContain('next-auth.session-token=;');

    // Session should now be unauthenticated
    const postSignoutSessionReq = new Request('/api/auth/session', {
      method: 'GET',
      headers: new Headers({ Cookie: sessionCookie }),
    });
    const postSignoutSessionRes = await GET(postSignoutSessionReq);
    const postSignoutData = await readJson(postSignoutSessionRes);
    expect(postSignoutData).toHaveProperty('user');
    expect(postSignoutData.user).toBeNull();
  });

  it('session retrieval when unauthenticated returns user: null', async () => {
    const res = await GET(new Request('/api/auth/session', { method: 'GET' }));
    expect(res.status).toBe(200);
    const data = await readJson(res);
    expect(data).toHaveProperty('user');
    expect(data.user).toBeNull();
    expect(data).toHaveProperty('expires');
    expect(data.expires).toBeNull();
  });

  it('error path: invalid provider returns 400', async () => {
    const res = await GET(new Request('/api/auth/signin?provider=invalid', { method: 'GET' }));
    expect(res.status).toBe(400);
    const body = await readJson(res);
    expect(body).toHaveProperty('error');
    expect(body.error).toBe('Unknown provider');
  });

  it('error path: callback error handling', async () => {
    const res = await GET(new Request('/api/auth/callback/mock?error=access_denied', { method: 'GET' }));
    expect(res.status).toBe(400);
    const body = await readJson(res);
    expect(body).toHaveProperty('error');
    expect(body.error).toBe('access_denied');
  });

  it('CSRF/method enforcement: non-POST on signout returns 405', async () => {
    const res = await GET(new Request('/api/auth/signout', { method: 'GET' }));
    expect(res.status).toBe(405);
  });

  it('CSRF/method enforcement: missing CSRF token returns 403 on signout', async () => {
    const res = await POST(new Request('/api/auth/signout', { method: 'POST' }));
    expect(res.status).toBe(403);
  });

  // Clean up after tests if needed
  afterEach(() => {
    // no-op
  });
});
