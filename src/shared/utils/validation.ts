/**
 * Form validation utilities.
 *
 * Mirrors the backend's class-validator rules so the UI can show
 * errors instantly without a round-trip.
 */

/** Minimum password length enforced by the backend. */
const MIN_PASSWORD_LENGTH = 8;
/** Maximum password length enforced by the backend. */
const MAX_PASSWORD_LENGTH = 128;

/**
 * Backend-compatible password complexity regex.
 * Requires at least one lowercase, one uppercase, one digit,
 * and one special character (`@$!%*?&`).
 */
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;

export interface ValidationResult {
  valid: boolean;
  error: string | null;
}

const ok: ValidationResult = { valid: true, error: null };
const fail = (error: string): ValidationResult => ({ valid: false, error });

/** Validate an email address (simple RFC-compliant check). */
export function validateEmail(email: string): ValidationResult {
  if (!email.trim()) return fail('Email is required');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Invalid email format');
  return ok;
}

/**
 * Validate a password against backend rules.
 *
 * @param password  - The password string.
 * @param required  - When `false` an empty password is accepted (e.g. edit forms).
 */
export function validatePassword(
  password: string,
  required = true,
): ValidationResult {
  if (!password) return required ? fail('Password is required') : ok;
  if (password.length < MIN_PASSWORD_LENGTH)
    return fail(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  if (password.length > MAX_PASSWORD_LENGTH)
    return fail(`Password must be at most ${MAX_PASSWORD_LENGTH} characters`);
  if (!PASSWORD_REGEX.test(password))
    return fail(
      'Password must contain at least one uppercase, one lowercase, one number, and one special character (@$!%*?&)',
    );
  return ok;
}

/** Validate a non-empty string field (e.g. firstName, lastName). */
export function validateRequired(
  value: string,
  fieldName: string,
): ValidationResult {
  if (!value.trim()) return fail(`${fieldName} is required`);
  if (value.length > 100) return fail(`${fieldName} must be at most 100 characters`);
  return ok;
}
