export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === 'object'

export const isArray = Array.isArray

export const extend = Object.assign

export const hasChanged = (value: unknown, oldValue: unknown): boolean => !Object.is(value, oldValue)
