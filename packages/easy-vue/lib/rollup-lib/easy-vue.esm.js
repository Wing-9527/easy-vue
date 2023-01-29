const isObject = (val) => val !== null && typeof val === 'object';
const isArray = Array.isArray;
const extend = Object.assign;
const hasChanged = (value, oldValue) => !Object.is(value, oldValue);
const NOOP = () => { };
const isFunction = (value) => typeof value === 'function';

// interface ReactiveEffectRunner {
//   (): any
//   effect: ReactiveEffect
// }
/**
 * TODO: ReactiveEffect 第二个参数 scheduler 待实现
 */
class ReactiveEffect {
    constructor(fn) {
        this.deps = [];
        this.active = true; // active 的作用，防止多次调用 cleanupEffect 清除依赖，浪费性能
        this.fn = fn;
    }
    run() {
        activeEffect = this; // run的时候，每次更新activeEffect指向
        let res = this.fn();
        // ! 重置
        activeEffect = void 0;
        return res;
    }
    /**
     * stop 方法，就是将 ReactiveEffect 上对应的副作用函数全部清除
     * runner.effect.stop() -> ReactiveEffectRunner.ReactiveEffect.stop()
     * stop 方法内的 this 为 ReactiveEffect 实例
     */
    stop() {
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
// /**
//  * TODO: 修复类型报错bug
//  * ? 源码此处：let activeEffect: ReactiveEffect | undefined
//  * ? 我这边按照源码方式初始化，`npm run test` 在 vitest 中测试无法通过，报类型错误
//  * ! 解决方式：必须 new ReactiveEffect(() => {}) 初始化赋值
//  */
// let activeEffect: ReactiveEffect | undefined = new ReactiveEffect(() => {})
let activeEffect;
let targetMap = new WeakMap(); // 副作用映射树
/**
 * ? 源码为什么不直接返回 ReactiveEffect 实例对象
 * ? 猜测1：方便能从 targetMap 映射树中删除对应的 effectFn（相关代码：dep.delete(effect) ）
 * ? 猜测2：方便 stop 停止后能再次触发响应式？
 */
function effect(fn, options) {
    let _effect = new ReactiveEffect(fn);
    extend(_effect, options);
    _effect.run();
    let runner = _effect.fn.bind(_effect);
    // @ts-ignore TODO: ts类型报错
    runner.effect = _effect;
    return runner;
}
// track dependencies
function track(target, key) {
    if (activeEffect) {
        let depsMap = targetMap.get(target);
        if (!depsMap) {
            targetMap.set(target, (depsMap = new Map()));
        }
        let dep = depsMap.get(key);
        if (!dep) {
            depsMap.set(key, (dep = new Set()));
        }
        trackEffects(dep);
    }
}
// trigger
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    if (depsMap === null || depsMap === void 0 ? void 0 : depsMap.size) { // fix: vitest属性报错
        let dep = depsMap.get(key);
        triggerEffects(dep);
    }
}
function stop(runner) {
    runner.effect.stop();
}
function trackEffects(dep) {
    // console.log('activeEffect', activeEffect)
    // debugger
    if (activeEffect) {
        dep.add(activeEffect);
        // @ts-ignore TODO: ts类型报错
        activeEffect.deps.push(dep);
    }
}
function triggerEffects(dep) {
    let effects = isArray(dep) ? dep : [...dep];
    effects.forEach((effect) => {
        // if (effect !== activeEffect) { // 防止无限循环
        effect.run();
        // }
    });
}
// 清除副作用函数
function cleanupEffect(effect) {
    // let { deps } = effect
    // if (deps.length) {
    //   deps.forEach((dep: Set<any>) => dep.delete(effect))
    //   deps.length = 0
    // }
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
}

function warn(msg, ...args) {
    console.warn(`[Vue warn] ${msg}`, ...args);
}

// 创建getter
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key, receiver) {
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) { // 当 key 是 __v_isReactive，则判定为已经是一个响应式对象
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) { // 当 key 是 __v_isReadonly，则判定为已经是一个只读对象
            return isReadonly;
        }
        else if ( // 当 key 是 __v_raw，判定为已经是一个代理对象。当缓存中有该代理对象时，直接返回原始的被代理对象
        key === "__v_raw" /* ReactiveFlags.RAW */ &&
            receiver ===
                (isReadonly
                    ? shallow
                        ? shallowReadonlyMap
                        : readonlyMap
                    : shallow
                        ? shallowReactiveMap
                        : reactiveMap).get(target)) {
            return target;
        }
        // 获取当前结果
        const res = Reflect.get(target, key, receiver);
        /**
         * ! 非只读，依赖收集
         */
        if (!isReadonly) {
            track(target, key);
        }
        /**
         * ! 如果是 shallow 一层，就不需要将深层嵌套转为响应式
         */
        if (shallow) {
            return res;
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
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
// 创建setter
function createSetter() {
    return function set(target, key, value, receiver) {
        // debugger
        // ? let oldValue = target[key]
        let res = Reflect.set(target, key, value, receiver);
        trigger(target, key);
        return res;
    };
}
// ! 缓存变量
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
const mutableHandlers = {
    get,
    set,
    // deleteProperty,
    // has,
    // ownKeys
};
const readonlyHandlers = {
    get: readonlyGet,
    set() {
        warn('Update failed: target is readonly');
        return true;
    }
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

const mutableCollectionHandlers = {

};
const readonlyCollectionHandlers = {};
const shallowReadonlyCollectionHandlers = {};

// 缓存
const reactiveMap = new WeakMap();
const shallowReactiveMap = new WeakMap();
const readonlyMap = new WeakMap();
const shallowReadonlyMap = new WeakMap();
function createReactiveObject(target, isReadonly, baseHandlers, collectionHandlers, proxyMap) {
    // 非对象类型，直接返回
    if (!isObject(target)) {
        return target;
    }
    // 如果缓存中有该代理对象，直接返回
    const existingProxy = proxyMap.get(target);
    if (existingProxy) {
        return existingProxy;
    }
    const proxy = new Proxy(target, baseHandlers);
    proxyMap.set(target, proxy);
    return proxy;
}
/**
 * api
 */
function reactive(target) {
    return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers, reactiveMap);
}
/**
 * api
 * @function 只读
 */
function readonly(target) {
    return createReactiveObject(target, true, readonlyHandlers, readonlyCollectionHandlers, readonlyMap);
}
/**
 * api
 */
function shallowReadonly(target) {
    return createReactiveObject(target, true, shallowReadonlyHandlers, shallowReadonlyCollectionHandlers, shallowReadonlyMap);
}
/**
 * @desc utilities
 */
function isReadonly(value) {
    return value && value["__v_isReadonly" /* ReactiveFlags.IS_READONLY */];
}
function isReactive(value) {
    if (isReadonly(value)) {
        return value && value["__v_raw" /* ReactiveFlags.RAW */];
    }
    return value && value["__v_isReactive" /* ReactiveFlags.IS_REACTIVE */];
}
function isProxy(value) {
    return isReactive(value) || isReadonly(value);
}
function toRaw(observed) {
    const raw = observed && observed["__v_raw" /* ReactiveFlags.RAW */];
    return raw ? toRaw(raw) : observed;
}
function markRaw() { }

class RefImpl {
    constructor(value, __v_isShallow) {
        this.__v_isShallow = __v_isShallow;
        this._v_isRef = true;
        this._rawValue = __v_isShallow ? value : toRaw(value);
        this._value = __v_isShallow ? value : reactive(value);
    }
    get value() {
        // track 收集依赖
        trackRefValue(this);
        return this._value;
    }
    set value(newVal) {
        /**
         * trigger 触发依赖
         * ! 相同值不触发set
         */
        if (hasChanged(newVal, this._rawValue)) {
            this._rawValue = newVal;
            this._value = this.__v_isShallow ? newVal : reactive(newVal);
            triggerRefValue(this);
        }
    }
}
function createRef(rawValue, shallow) {
    if (isRef(rawValue)) {
        return rawValue;
    }
    return new RefImpl(rawValue, shallow);
}
function ref(value) {
    return createRef(value, false);
}
// 追踪 Ref.value
function trackRefValue(ref) {
    ref = toRaw(ref);
    trackEffects(ref.dep || (ref.dep = new Set()));
}
function triggerRefValue(ref) {
    ref = toRaw(ref);
    if (ref.dep)
        triggerEffects(ref.dep);
}
function isRef(r) {
    return !!(r && r.__v_isRef === true);
}
function unref(ref) {
    return isRef(ref) ? ref.value : ref;
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
class ComputedRefImpl {
    constructor(getter, _setter, isReadonly, // ! 当 getterOrOptions 为函数时，或者 getterOrOptions 为对象却没有 setter 时，是只读
    isSSR) {
        this._setter = _setter;
        this._dirty = true;
        this.effect = new ReactiveEffect(getter);
        // triggerRefValue(this)
        this["__v_isReadonly" /* ReactiveFlags.IS_READONLY */] = isReadonly;
        this.effect.active = !isSSR;
        this.effect.computed = this;
    }
    get value() {
        // trackRefValue(this)
        // if (this._dirty) {
        //   this._dirty = false
        this._value = this.effect.run();
        // }
        return this._value;
    }
    set value(newValue) {
        this._setter(newValue);
    }
}
function computed(getterOrOptions, debugOptions, isSSR = false) {
    let getter;
    let setter;
    if (isFunction(getterOrOptions)) {
        getter = getterOrOptions;
        setter = NOOP;
    }
    else {
        getter = getterOrOptions.get;
        setter = getterOrOptions.set;
    }
    const cRef = new ComputedRefImpl(getter, setter, isFunction(getterOrOptions) || !setter, isSSR);
    // TODO: 此处还应对 debugOptions 参数做处理
    return cRef;
}

export { ComputedRefImpl, NOOP, ReactiveEffect, computed, effect, extend, hasChanged, isArray, isFunction, isObject, isProxy, isReactive, isReadonly, isRef, markRaw, reactive, reactiveMap, readonly, readonlyMap, ref, shallowReactiveMap, shallowReadonly, shallowReadonlyMap, stop, toRaw, track, trackEffects, trackRefValue, trigger, triggerEffects, triggerRefValue, unref };
//# sourceMappingURL=easy-vue.esm.js.map
