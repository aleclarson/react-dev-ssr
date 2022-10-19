export function mark<T>(obj: T, tag: symbol): T {
  return Object.defineProperty(obj, tag, { value: true })
}
