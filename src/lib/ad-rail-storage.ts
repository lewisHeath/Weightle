const STORAGE_KEY = "weightle-ad-rails-collapsed-v1";

export type AdRailSide = "left" | "right";

export type AdRailsCollapsed = Record<AdRailSide, boolean>;

const defaultState = (): AdRailsCollapsed => ({
  left: false,
  right: false,
});

export function loadAdRailsCollapsed(): AdRailsCollapsed {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<AdRailsCollapsed>;
    return { ...defaultState(), ...parsed };
  } catch {
    return defaultState();
  }
}

export function saveAdRailsCollapsed(state: AdRailsCollapsed): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function toggleAdRail(
  state: AdRailsCollapsed,
  side: AdRailSide,
): AdRailsCollapsed {
  return { ...state, [side]: !state[side] };
}
