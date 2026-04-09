export function isUseMock() {
  return import.meta.env.VITE_USE_MOCK !== 'false'
}

export function mockPromise<T>(data: T, timeout = 160): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(data)), timeout)
  })
}
