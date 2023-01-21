import { hasChanged } from "@easy-vue/shared"
import { trackEffects, triggerEffects } from "./effect"
import { reactive, toRaw } from "./reactive"

interface Ref<T = any> {
  value: T
}

interface RefBase extends Ref {
  dep?: Set<any>
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
    // track 收集依赖
    trackRefValue(this)
    return this._value
  }
  set value(newVal) {
    /**
     * trigger 触发依赖
     * ! 相同值不触发set
     */
    if (hasChanged(newVal, this._rawValue)) {   
      this._rawValue = newVal
      this._value = this.__v_isShallow ? newVal : reactive(newVal)
      triggerRefValue(this)
    }
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

// 追踪 Ref.value
export function trackRefValue(ref: RefBase) {
  ref = toRaw(ref)
  trackEffects(ref.dep || (ref.dep = new Set()))
}

export function triggerRefValue(ref: RefBase) {
  ref = toRaw(ref)
  if (ref.dep) triggerEffects(ref.dep) 
}

export function isRef(r: any): r is Ref {
  return !!(r && r.__v_isRef === true)
}

export function unref(ref: unknown) {
  return isRef(ref) ? ref.value : ref
}
