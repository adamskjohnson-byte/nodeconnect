let imageVersion: string | null = null
const listeners = new Set<() => void>()

export function getAvatarVersion(): string | null {
  return imageVersion
}

export function subscribeAvatarVersion(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function publishAvatarVersion(version: string | null): void {
  imageVersion = version
  listeners.forEach((listener) => listener())
}