import { NOOP, isFunction } from "@easy-vue/shared";
import { ReactiveFlags } from "./reactive";
import { ReactiveEffect } from "./effect";
import { trackRefValue, triggerRefValue } from "./ref";

export type ComputedGetter = (...args: unknown[]) => unknown
export type ComputedSetter = (value: any) => void

export interface WritableComputedOptions {
  get: ComputedGetter
  set: ComputedSetter
}

/**
 * 问题1：
 *    无法满足 tase-case 2，Computed.value 作为被监听对象 发生变化时，无法触发对应的副作用函数 
 *    TODO: 还需对 Computed.value 做处理
 *    track ref value
 *    trigger ref value
 * 问题2：
 *    还未对 debugOptions 做处理
 *    TODO: debugOptions.onTrack debugOptions.onTrigger
 * 问题3：
 *    计算属性缓存未实现
 *    TODO: _dirty
 * 问题4：
 *    需要实现 ReactiveEffect 第二个参数 scheduler，配合实现计算属性缓存
 *    TODO: ReactiveEffect scheduler
 */
export class ComputedRefImpl {
  public effect: ReactiveEffect
  public readonly [ReactiveFlags.IS_READONLY]: boolean
  public _dirty = true
  public _value: unknown
  constructor(
    getter: ComputedGetter,
    private readonly _setter: ComputedSetter,
    isReadonly: boolean, // ! 当 getterOrOptions 为函数时，或者 getterOrOptions 为对象却没有 setter 时，是只读
    isSSR: boolean
  ) {
    this.effect = new ReactiveEffect(getter)
    // triggerRefValue(this)
    this[ReactiveFlags.IS_READONLY] = isReadonly
    this.effect.active = !isSSR
    this.effect.computed = this
  }

  get value() {
    // trackRefValue(this)
    // if (this._dirty) {
    //   this._dirty = false
      this._value = this.effect.run()
    // }
    return this._value
  }

  set value(newValue: any) {
    this._setter(newValue)
  }
}

export function computed(
  getterOrOptions: ComputedGetter |WritableComputedOptions,
  debugOptions?: object,
  isSSR = false
) {
  let getter: ComputedGetter
  let setter: ComputedSetter
  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions
    setter = NOOP
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }
  const cRef = new ComputedRefImpl(getter, setter, isFunction(getterOrOptions) || !setter, isSSR)
  // TODO: 此处还应对 debugOptions 参数做处理
  return cRef
}