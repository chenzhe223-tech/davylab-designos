import test from "node:test";
import assert from "node:assert/strict";
import { normalizeVoiceRequest } from "../vibe-studio/voice-contract.mjs";

test("normalizes basic speech", () => {
  assert.deepEqual(normalizeVoiceRequest({ text: "  你好 DAVYLAB  " }), {
    engine: "voxcpm2", mode: "tts", text: "你好 DAVYLAB", seed: 42
  });
});
test("voice design requires description", () => {
  assert.throws(() => normalizeVoiceRequest({ mode: "design", text: "Hello" }));
  assert.equal(normalizeVoiceRequest({ mode: "design", text: "Hello", voiceDescription: "Warm narrator" }).voiceDescription, "Warm narrator");
});
test("clone is consent-gated and uses asset IDs, not arbitrary URLs", () => {
  assert.throws(() => normalizeVoiceRequest({ mode: "clone", text: "Hello", referenceAssetId: "voice_123456" }));
  assert.throws(() => normalizeVoiceRequest({ mode: "clone", text: "Hello", referenceAssetId: "https://example.com/audio.wav", consent: true }));
  assert.equal(normalizeVoiceRequest({ mode: "clone", text: "Hello", referenceAssetId: "voice_123456", consent: true }).mode, "clone");
});
test("rejects invalid or oversized text and unsupported modes", () => {
  for (const input of [{}, { text: "x".repeat(2001) }, { text: "ok", mode: "other" }, { text: "ok", seed: -1 }]) {
    assert.throws(() => normalizeVoiceRequest(input));
  }
});
