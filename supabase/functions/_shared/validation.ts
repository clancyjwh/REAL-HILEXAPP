export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function validateRequired(value: any, fieldName: string): { valid: boolean; error?: string } {
  if (value === null || value === undefined || value === '') {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true };
}

export function validateStringLength(
  value: string,
  fieldName: string,
  min?: number,
  max?: number
): { valid: boolean; error?: string } {
  if (min !== undefined && value.length < min) {
    return { valid: false, error: `${fieldName} must be at least ${min} characters` };
  }
  if (max !== undefined && value.length > max) {
    return { valid: false, error: `${fieldName} must be no more than ${max} characters` };
  }
  return { valid: true };
}

export function validateNumber(
  value: any,
  fieldName: string,
  min?: number,
  max?: number
): { valid: boolean; error?: string } {
  const num = Number(value);
  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} must be a number` };
  }
  if (min !== undefined && num < min) {
    return { valid: false, error: `${fieldName} must be at least ${min}` };
  }
  if (max !== undefined && num > max) {
    return { valid: false, error: `${fieldName} must be no more than ${max}` };
  }
  return { valid: true };
}

export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
