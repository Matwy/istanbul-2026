const CHECKLIST_KEY = 'istanbul-checklist-v1';

export type ChecklistState = Record<string, boolean>;

export function loadChecklist(): ChecklistState {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CHECKLIST_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as ChecklistState;
    }
    return {};
  } catch {
    return {};
  }
}

export function saveChecklist(state: ChecklistState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CHECKLIST_KEY, JSON.stringify(state));
  } catch {
    // quota exceeded or private mode — fail silently
  }
}
