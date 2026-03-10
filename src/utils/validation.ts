export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateSymbol(symbol: string): boolean {
  return /^[A-Z0-9/-]{1,20}$/i.test(symbol);
}

export function validateQuery(query: string): { valid: boolean; error?: string } {
  if (!query || query.trim().length === 0) {
    return { valid: false, error: 'Query cannot be empty' };
  }

  if (query.length > 500) {
    return { valid: false, error: 'Query is too long (max 500 characters)' };
  }

  const sanitized = sanitizeString(query);
  if (sanitized.length === 0) {
    return { valid: false, error: 'Query contains invalid characters' };
  }

  return { valid: true };
}

export function validateAssetClass(assetClass: string): boolean {
  const validClasses = ['stocks', 'crypto', 'forex', 'commodities'];
  return validClasses.includes(assetClass.toLowerCase());
}

export function validateNumber(value: any, min?: number, max?: number): boolean {
  const num = Number(value);
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
}

export function validateDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
