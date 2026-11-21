// VoxCPM2 P0: dependency-free contract shared by UI, API and tests.
// Never store reference audio or authorization credentials in this object.
export const VOICE_ENGINE = "voxcpm2";
export const VOICE_MODES = Object.freeze(["tts", "design", "clone"]);
export function normalizeVoiceRequest(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new TypeError("Voice request must be an object");
  const mode = input.mode ?? "tts";
  if (!VOICE_MODES.includes(mode)) throw new RangeError("Unsupported voice mode");
  const text = typeof input.text === "string" ? input.text.trim() : "";
  if (!text || text.length > 2000) throw new RangeError("Text must contain 1–2000 characters");
  const voiceDescription = typeof input.voiceDescription === "string" ? input.voiceDescription.trim() : "";
  if (voiceDescription.length > 300) throw new RangeError("Voice description too long");
  if (mode === "design" && !voiceDescription) throw new RangeError("Voice design requires a description");
  const referenceAssetId = typeof input.referenceAssetId === "string" ? input.referenceAssetId.trim() : "";
  if (mode === "clone" && (!/^[a-zA-Z0-9_-]{8,100}$/.test(referenceAssetId) || input.consent !== true)) {
    throw new RangeError("Cloning requires an approved reference asset and explicit consent");
  }
  const seed = input.seed ?? 42;
  if (!Number.isSafeInteger(seed) || seed < 0 || seed > 2147483647) throw new RangeError("Invalid seed");
  return Object.freeze({
    engine: VOICE_ENGINE, mode, text,
    ...(mode === "design" ? { voiceDescription } : {}),
    ...(mode === "clone" ? { referenceAssetId, consent: true } : {}),
    seed
  });
}
