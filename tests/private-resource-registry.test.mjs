import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequestGet, verifyAccessToken } from '../functions/resources/private-registry.json.js';

const webcrypto = globalThis.crypto;
const { publicKey, privateKey } = await webcrypto.subtle.generateKey(
  { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
  true,
  ['sign', 'verify']
);
const jwk = await webcrypto.subtle.exportKey('jwk', publicKey);
jwk.kid = 'test-access-key';
jwk.alg = 'RS256';
jwk.use = 'sig';

const env = {
  TEAM_DOMAIN: 'https://team.example.cloudflareaccess.com',
  POLICY_AUD: 'resource-hub-audience',
  PRIVATE_REGISTRY_OWNER_EMAIL: 'owner@example.com'
};
const toBase64Url = value => Buffer.from(value).toString('base64url');

async function signToken(overrides = {}) {
  const header = toBase64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: jwk.kid }));
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: env.TEAM_DOMAIN,
    aud: env.POLICY_AUD,
    email: 'owner@example.com',
    exp: now + 300,
    nbf: now - 1,
    ...overrides
  };
  const body = toBase64Url(JSON.stringify(payload));
  const signingInput = header + '.' + body;
  const signature = await webcrypto.subtle.sign('RSASSA-PKCS1-v1_5', privateKey, new TextEncoder().encode(signingInput));
  return signingInput + '.' + toBase64Url(signature);
}

async function withMockKeys(fn) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ keys: [jwk] }), {
    status: 200, headers: { 'content-type': 'application/json' }
  });
  try { return await fn(); } finally { globalThis.fetch = originalFetch; }
}

test('Access JWT validates signature, issuer, audience and owner identity', async () => {
  const token = await signToken();
  await withMockKeys(async () => {
    const payload = await verifyAccessToken(token, env);
    assert.equal(payload.email, 'owner@example.com');
  });
});

test('Access JWT rejects wrong owner, audience and expired tokens', async () => {
  const wrongOwner = await signToken({ email: 'other@example.com' });
  const wrongAudience = await signToken({ aud: 'wrong-audience' });
  const expired = await signToken({ exp: Math.floor(Date.now() / 1000) - 1 });
  await assert.rejects(() => verifyAccessToken(wrongOwner, env), /owner_identity_required/);
  await assert.rejects(() => verifyAccessToken(wrongAudience, env), /invalid_audience/);
  await assert.rejects(() => verifyAccessToken(expired, env), /token_expired/);
});

test('private endpoint does not read KV without an authenticated owner identity', async () => {
  let reads = 0;
  const runtime = { ...env, PRIVATE_SKILLS: { async get() { reads += 1; return JSON.stringify({ resources: [{ id: 'private-fixture' }] }); } } };
  const missing = await onRequestGet({ request: new Request('https://example.com/resources/private-registry.json'), env: runtime });
  assert.equal(missing.status, 401);
  assert.equal(reads, 0);

  const ownerToken = await signToken();
  await withMockKeys(async () => {
    const response = await onRequestGet({
      request: new Request('https://example.com/resources/private-registry.json', { headers: { 'Cf-Access-Jwt-Assertion': ownerToken } }),
      env: runtime
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'private, no-store, max-age=0');
    assert.deepEqual(await response.json(), { resources: [{ id: 'private-fixture' }] });
  });
  assert.equal(reads, 1);
});
