import {
  ReactiveFlags,
  reactiveMap,
  shallowReactiveMap,
  readonlyMap,
  shallowReadonlyMap
} from "./reactive"

// 创建getter
function createGetter(isReadonly = false, shallow = false) {
  return function get(target: object, key: string | symbol, receiver: object) {
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
     * TODO
     * ! 依赖收集
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

    return res
  }
}

// 创建setter
function createSetter() {}

const get = createGetter()
const set = createSetter()

export const mutableHandlers: ProxyHandler<object> = {
  get,
  // set,
  // deleteProperty,
  // has,
  // ownKeys
}