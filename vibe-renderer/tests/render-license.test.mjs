import test from 'node:test';
import assert from 'node:assert/strict';
import {renderLicenseFlags} from '../render-license.mjs';

test('licenses are required before executing a Remotion render',()=>{
 assert.throws(()=>renderLicenseFlags({}),/Missing VIBE_REMOTION_LICENSE_KEY/);
 assert.throws(()=>renderLicenseFlags({VIBE_REMOTION_LICENSE_KEY:'free-license'}),/explicitly confirmed/);
});

test('explicitly confirmed free license defaults to development render',()=>{
 const flags=renderLicenseFlags({VIBE_REMOTION_LICENSE_KEY:'free-license',VIBE_FREE_LICENSE_CONFIRMED:'true'});
 assert.deepEqual(flags,['--license-key=free-license','--is-production=false']);
});

test('paid license without production approval does not incur production render classification',()=>{
 const flags=renderLicenseFlags({VIBE_REMOTION_LICENSE_KEY:'rm_sec_dummyvalue'});
 assert.deepEqual(flags,['--license-key=rm_sec_dummyvalue','--is-production=false']);
 assert.throws(()=>renderLicenseFlags({VIBE_REMOTION_LICENSE_KEY:'rm_sec_dummyvalue',VIBE_RENDER_PRODUCTION:'true'}),/cost authorization/);
});

test('invalid or public keys never reach the render CLI',()=>{
 assert.throws(()=>renderLicenseFlags({VIBE_REMOTION_LICENSE_KEY:'rm_pub_public'}),/Invalid server-side/);
 assert.throws(()=>renderLicenseFlags({VIBE_REMOTION_LICENSE_KEY:'invalid-123'}),/Invalid server-side/);
});
