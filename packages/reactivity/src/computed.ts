import { NOOP, isFunction } from "@easy-vue/shared";
import { ReactiveFlags } from "./reactive";
import { ReactiveEffect } from "./effect";

export type ComputedGetter = (...args: unknown[]) => unknown
export type ComputedSetter = (value: any) => void

export interface WritableComputedOptions {
  get: ComputedGetter
  set: ComputedSetter
}

export class ComputedRefImpl {
  public effect: ReactiveEffect
  public readonly [ReactiveFlags.IS_READONLY]: boolean
  constructor(
    getter: ComputedGetter,
    private readonly _setter: ComputedSetter,
    isReadonly: boolean, // ! 当 getterOrOptions 为函数时，或者 getterOrOptions 为对象却没有 setter 时，是只读
    isSSR: boolean
  ) {
    this.effect = new ReactiveEffect(getter)
    this[ReactiveFlags.IS_READONLY] = isReadonly
    this.effect.active = !isSSR
    this.effect.computed = this
  }

  get value() {
    return this.effect.run()
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