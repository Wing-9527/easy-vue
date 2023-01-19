import { isObject, extend } from "@easy-vue/shared"
import { track, trigger } from "./effect"
import {
  ReactiveFlags,
  reactiveMap,
  shallowReactiveMap,
  readonlyMap,
  shallowReadonlyMap,
  reactive,
  readonly
} from "./reactive"
import { warn } from "./warning"

// 创建getter
function createGetter(isReadonly = false, shallow = false) {
  return function get(target: any, key: string | symbol, receiver: object) {
    if (key === ReactiveFlags.IS_REACTIVE) { // 当 key 是 __v_isReactive，则判定为已经是一个响应式对象
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) { // 当 key 是 __v_isReadonly，则判定为已经是一个只读对象
      return isReadonly
    } else if ( // 当 key 是 __v_raw，判定为已经是一个代理对象。当缓存中有该代理对象时，直接返回原始的被代理对象
      key === ReactiveFlags.RAW &&
      receiver ===
        (isReadonly
          ? shallow
            ? shallowReadonlyMap
            : readonlyMap
          : shallow
            ? shallowReactiveMap
            : reactiveMap
        ).get(target)
    ) {
      return target
    }
    // 获取当前结果
    const res = Reflect.get(target, key, receiver)

    /**
     * ! 非只读，依赖收集
     */
    if (!isReadonly) {
      track(target, key)
    }

    /**
     * ! 如果是 shallow 一层，就不需要将深层嵌套转为响应式
     */
    if (shallow) {
      return res
    }

    /**
     * TODO
     * ! 源码此处有处理ref对象的操作
     */

    /**
     * TODO
     * ? 如果属性是对象，为什么要对属性再做一次代理
     *    答：猜测，为了递归做依赖收集？
     *    答：待验证：不把 a.b 变成proxy的话，直接修改 a.b.c 无法触发页面更新
     */
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }

    return res
  }
}

// 创建setter
function createSetter() {
  return function set(target: any, key: string | symbol, value: any, receiver: object) {
    // debugger
    // ? let oldValue = target[key]
    let res = Reflect.set(target, key, value, receiver)
    trigger(target, key)
    return res
  }
}

// ! 缓存变量
const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

export const mutableHandlers: ProxyHandler<object> = {
  get,
  set,
  // deleteProperty,
  // has,
  // ownKeys
}

export const readonlyHandlers: ProxyHandler<any> = {
  get: readonlyGet,
  set() { // 不允许改变值
    warn('Update failed: target is readonly')
    return true
  }
}

export const shallowReadonlyHandlers: ProxyHandler<object> = extend(
  {},
  readonlyHandlers,
  {
    get: shallowReadonlyGet
  }
)
