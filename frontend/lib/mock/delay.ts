export function delay<T>(value: T, ms = 180): Promise<T> {
  return new Promise((resolve) => {
    globalThis.setTimeout(() => resolve(value), ms);
  });
}
