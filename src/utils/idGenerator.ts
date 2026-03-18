let counter = Date.now();

export function generateId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter.toString(36)}`;
}
