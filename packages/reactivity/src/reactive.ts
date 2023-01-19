import { isObject } from '@easy-vue/shared'
import {
  mutableHandlers,
  readonlyHandlers
} from './baseHandlers'
import {
  mutableCollectionHandlers,
  readonlyCollectionHandlers
} from './collectionHandlers'

// 缓存
export const reactiveMap = new WeakMap()
export const shallowReactiveMap = new WeakMap()
export const readonlyMap = new WeakMap()
export const shallowReadonlyMap = new WeakMap()

export const enum ReactiveFlags {
  SKIP = '__v_skip', // 跳过，不做响应式处理的数据
  IS_REACTIVE = '__v_isReactive', // 是 reactive 状态
  IS_READONLY = '__v_isReadonly', // 是 readonly 状态
  IS_SHALLOW = '__v_isShallow', // 是 shallow 状态
  RAW = '__v_raw' // 表示proxy 对应的源数据，target 已经是 proxy 对象时会有该属性
}

function createReactiveObject(target: object, isReadonly: boolean, baseHandlers: object, collectionHandlers: object, proxyMap: WeakMap<any, any>) {
  // 非对象类型，直接返回
  if (!isObject(target)) {
    return target
  }
  // 如果缓存中有该代理对象，直接返回
  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }
  const proxy = new Proxy(
    target,
    baseHandlers
  )
  proxyMap.set(target, proxy)
  return proxy
}

export function reactive(target: object) {
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers,
    reactiveMap
  )
}

/** @function 只读 */
export function readonly(target: object) {
  return createReactiveObject(
    target,
    true,
    readonlyHandlers,
    readonlyCollectionHandlers,
    readonlyMap
  )
}

/** 
 * @desc utilities
 */
export function isReadonly(value: any): boolean {
  return value && value[ReactiveFlags.IS_READONLY]
}

export function isReactive(value: any): boolean {
  if (isReadonly(value)) {
    return value && value[ReactiveFlags.RAW]
  }
  return value && value[ReactiveFlags.IS_REACTIVE]
}

export function isProxy(value: any): boolean {
  return isReactive(value) || isReadonly(value)
}

export function toRaw() {}
export function markRaw() {}

