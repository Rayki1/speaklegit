export const HUD_SETTINGS_KEY = "speaks-hud-settings";

export const DEFAULT_HUD_SETTINGS = {
  intensity: "balanced",
  audioEnabled: true,
  cameraShakeEnabled: true,
  debugEnabled: false,
  performanceMode: false,
  vignetteStrength: 55,
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function detectDefaultIntensity() {
  if (typeof window === "undefined") return "balanced";

  const memory = Number(window.navigator?.deviceMemory || 0);
  const cores = Number(window.navigator?.hardwareConcurrency || 0);

  if ((memory && memory <= 4) || (cores && cores <= 4)) return "lite";
  return "balanced";
}

export function sanitizeHudSettings(input) {
  const intensity = ["lite", "balanced", "extreme"].includes(input?.intensity)
    ? input.intensity
    : detectDefaultIntensity();

  const vignetteStrength = clamp(Number(input?.vignetteStrength ?? DEFAULT_HUD_SETTINGS.vignetteStrength), 0, 100);

  return {
    intensity,
    audioEnabled: input?.audioEnabled !== false,
    cameraShakeEnabled: input?.cameraShakeEnabled !== false,
    debugEnabled: Boolean(input?.debugEnabled),
    performanceMode: Boolean(input?.performanceMode),
    vignetteStrength,
  };
}

export function loadHudSettings() {
  if (typeof window === "undefined") return { ...DEFAULT_HUD_SETTINGS };

  try {
    const raw = window.localStorage.getItem(HUD_SETTINGS_KEY);
    if (!raw) {
      return {
        ...DEFAULT_HUD_SETTINGS,
        intensity: detectDefaultIntensity(),
      };
    }
    return sanitizeHudSettings(JSON.parse(raw));
  } catch {
    return {
      ...DEFAULT_HUD_SETTINGS,
      intensity: detectDefaultIntensity(),
    };
  }
}

export function saveHudSettings(settings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HUD_SETTINGS_KEY, JSON.stringify(sanitizeHudSettings(settings)));
}

export function getEffectiveHudSettings(settings) {
  const safe = sanitizeHudSettings(settings);

  if (!safe.performanceMode) return safe;

  return {
    ...safe,
    intensity: "lite",
    cameraShakeEnabled: false,
    vignetteStrength: 0,
  };
}
