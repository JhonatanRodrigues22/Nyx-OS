export function requireNonEmpty(value: string, fieldName: string): void {
  if (!value.trim()) {
    throw new Error(`${fieldName} must not be empty.`);
  }
}

export function requireIsoDateLike(value: string, fieldName: string): void {
  requireNonEmpty(value, fieldName);

  if (Number.isNaN(Date.parse(value))) {
    throw new Error(`${fieldName} must be a valid date string.`);
  }
}
