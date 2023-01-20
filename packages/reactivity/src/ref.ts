import { reactive, toRaw } from "./reactive"

interface Ref<T = any> {
  value: T
}

class RefImpl {
  public readonly _v_isRef = true
  private _value: any
  private _rawValue: any
  constructor(value: any, public readonly __v_isShallow: boolean) {
    this._rawValue = __v_isShallow ? value : toRaw(value)
    this._value = __v_isShallow ? value : reactive(value)
  }
  get value() {
    // TODO: track 收集依赖
    return this._value
  }
  set value(newVal) {
    // TODO: trigger 触发依赖
    this._rawValue = newVal
    this._value = this.__v_isShallow ? newVal : reactive(newVal)
  }
}

function createRef(rawValue: any, shallow: boolean) {
  if (isRef(rawValue)) {
    return rawValue
  }
  return new RefImpl(rawValue, shallow)
}

export function ref(value?: unknown)  {
  return createRef(value, false)
}

export function isRef(r: any): r is Ref {
  return !!(r && r.__v_isRef === true)
}

export function unref(ref: unknown) {
  return isRef(ref) ? ref.value : ref
}
