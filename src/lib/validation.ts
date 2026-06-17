/**
 * Validation and Normalization Layer
 *
 * All Firestore write payloads should pass through these validators before
 * being committed. Normalization functions convert legacy mobile data formats
 * to the canonical web format without modifying stored documents.
 *
 * DESIGN PRINCIPLES:
 * - Validators never throw; they return { valid, reason } so callers can
 *   decide whether to skip or log.
 * - Normalizers always return a safe fallback when input is unrecognised.
 * - All functions are pure and side-effect free.
 */

import { Era, HabitType } from '../types';
import { BUILDINGS, GRID_SIZE } from '../constants';

// ---------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------

/**
 * Converts any known era string variant to the canonical `Era` enum value.
 *
 * Supported input formats (case-insensitive, spaces/underscores tolerated):
 *   "Stone Age", "STONE AGE", "stone_age", "Stone_Age", "STONE_AGE", etc.
 *
 * Falls back to `Era.STONE_AGE` when the input cannot be mapped.
 */
export function normalizeEra(value: unknown): Era {
  if (typeof value !== 'string' || value.trim() === '') return Era.STONE_AGE;

  // Strip spaces, underscores and hyphens, then uppercase for comparison
  const key = value.replace(/[\s_\-]+/g, '').toUpperCase();

  const eraMap: Record<string, Era> = {
    STONEAGE: Era.STONE_AGE,
    MEDIEVAL: Era.MEDIEVAL,
    INDUSTRIAL: Era.INDUSTRIAL,
    MODERN: Era.MODERN,
    DIGITAL: Era.DIGITAL,
    // Also handle cases where the canonical value is already passed
    [Era.STONE_AGE.replace(/[\s_\-]+/g, '').toUpperCase()]: Era.STONE_AGE,
    [Era.MEDIEVAL.replace(/[\s_\-]+/g, '').toUpperCase()]: Era.MEDIEVAL,
    [Era.INDUSTRIAL.replace(/[\s_\-]+/g, '').toUpperCase()]: Era.INDUSTRIAL,
    [Era.MODERN.replace(/[\s_\-]+/g, '').toUpperCase()]: Era.MODERN,
    [Era.DIGITAL.replace(/[\s_\-]+/g, '').toUpperCase()]: Era.DIGITAL,
  };

  return eraMap[key] ?? Era.STONE_AGE;
}

/**
 * Normalizes an array of era values (e.g. `stats.unlockedEras`).
 */
export function normalizeEras(values: unknown[]): Era[] {
  if (!Array.isArray(values)) return [Era.STONE_AGE];
  return [...new Set(values.map(normalizeEra))];
}

/**
 * Validates and normalizes a habit type string.
 * Accepts case-insensitive 'daily', 'weekly', 'monthly'.
 * Falls back to 'daily' for unrecognised values.
 */
export function normalizeHabitType(value: unknown): HabitType {
  if (typeof value !== 'string') return 'daily';
  const lower = value.trim().toLowerCase();
  if (lower === 'daily' || lower === 'weekly' || lower === 'monthly') return lower as HabitType;
  return 'daily';
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

const VALID_HABIT_TYPES: HabitType[] = ['daily', 'weekly', 'monthly'];
const VALID_LOG_TYPES = ['habit', 'city', 'economy', 'system'] as const;
const VALID_LOG_UNITS = ['hp', 'gold', 'silver', 'exp', 'pop', 'system'] as const;

/**
 * Validates a habit payload before writing to Firestore.
 */
export function validateHabitPayload(payload: {
  title?: unknown;
  type?: unknown;
}): ValidationResult {
  if (!payload || typeof payload.title !== 'string' || payload.title.trim() === '') {
    return { valid: false, reason: 'title must be a non-empty string' };
  }
  if (typeof payload.type !== 'string' || !VALID_HABIT_TYPES.includes(payload.type as HabitType)) {
    return { valid: false, reason: `type must be one of: ${VALID_HABIT_TYPES.join(', ')}` };
  }
  return { valid: true };
}

/**
 * Validates a building deployment payload.
 */
export function validateBuildingPayload(payload: {
  buildingTypeId?: unknown;
  gridX?: unknown;
  gridY?: unknown;
  level?: unknown;
  health?: unknown;
}): ValidationResult {
  if (!payload || typeof payload.buildingTypeId !== 'string' || payload.buildingTypeId.trim() === '') {
    return { valid: false, reason: 'buildingTypeId must be a non-empty string' };
  }
  // buildingTypeId must exist in the BUILDINGS catalog
  const known = BUILDINGS.some(b => b.id === payload.buildingTypeId);
  if (!known) {
    return { valid: false, reason: `buildingTypeId "${payload.buildingTypeId}" not found in BUILDINGS catalog` };
  }
  if (!isValidCoord(payload.gridX) || !isValidCoord(payload.gridY)) {
    return { valid: false, reason: `gridX/gridY must be integers in [0, ${GRID_SIZE})` };
  }
  if (typeof payload.level !== 'number' || payload.level < 1) {
    return { valid: false, reason: 'level must be >= 1' };
  }
  if (typeof payload.health !== 'number' || payload.health < 0 || payload.health > 100) {
    return { valid: false, reason: 'health must be in [0, 100]' };
  }
  return { valid: true };
}

function isValidCoord(v: unknown): boolean {
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < GRID_SIZE;
}

/**
 * Generates the canonical building document ID from grid coordinates.
 * This matches the mobile schema: `${gridX}_${gridY}`
 *
 * Example: buildingDocId(4, 7) => "4_7"
 */
export function buildingDocId(gridX: number, gridY: number): string {
  return `${gridX}_${gridY}`;
}

/**
 * Checks whether a building document ID uses the deterministic
 * `${gridX}_${gridY}` format (as opposed to a legacy random ID).
 */
export function isDeterministicBuildingId(docId: string, gridX: number, gridY: number): boolean {
  return docId === buildingDocId(gridX, gridY);
}

/**
 * Validates a log entry payload before writing.
 */
export function validateLogPayload(payload: {
  type?: unknown;
  unit?: unknown;
  message?: unknown;
}): ValidationResult {
  if (!payload) return { valid: false, reason: 'payload is null/undefined' };
  if (typeof payload.message !== 'string' || payload.message.trim() === '') {
    return { valid: false, reason: 'message must be a non-empty string' };
  }
  if (typeof payload.type !== 'string' || !VALID_LOG_TYPES.includes(payload.type as typeof VALID_LOG_TYPES[number])) {
    return { valid: false, reason: `type must be one of: ${VALID_LOG_TYPES.join(', ')}` };
  }
  if (typeof payload.unit !== 'string' || !VALID_LOG_UNITS.includes(payload.unit as typeof VALID_LOG_UNITS[number])) {
    return { valid: false, reason: `unit must be one of: ${VALID_LOG_UNITS.join(', ')}` };
  }
  return { valid: true };
}

/**
 * Validates a Firestore collection path string.
 * - Must have an odd number of segments (collection/doc/...).
 * - Each segment must be non-empty.
 * - Known root collections: users, leaderboard.
 */
export function validateCollectionPath(path: string): ValidationResult {
  if (!path || typeof path !== 'string') {
    return { valid: false, reason: 'path must be a non-empty string' };
  }
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0 || segments.length % 2 === 0) {
    return { valid: false, reason: `path must have an odd number of segments, got ${segments.length}` };
  }
  if (segments.some(s => s.trim() === '')) {
    return { valid: false, reason: 'path contains empty segments' };
  }
  const root = segments[0];
  const knownRoots = ['users', 'leaderboard', 'test'];
  if (!knownRoots.includes(root)) {
    return { valid: false, reason: `unknown root collection "${root}"` };
  }
  return { valid: true };
}
