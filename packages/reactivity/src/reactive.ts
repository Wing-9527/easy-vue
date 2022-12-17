import { isObject } from '@easy-vue/shared'
import { mutableHandlers } from './baseHandlers'
import { mutableCollectionHandlers } from './collectionHandlers'

// reactive缓存
export const reactiveMap = new WeakMap()

export function reactive(target: object) {
  return createReactiveObject(target, mutableHandlers, mutableCollectionHandlers, reactiveMap)
}

function createReactiveObject(target: object, baseHandlers: object, collectionHandlers: object, proxyMap: WeakMap<any, any>) {
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

