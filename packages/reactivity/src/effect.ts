type EffectFn = (...args: unknown[]) => unknown

// interface ReactiveEffectRunner {
//   (): any
//   effect: ReactiveEffect
// }

class ReactiveEffect {
  public fn: EffectFn
  public deps = []
  constructor(fn: EffectFn) {
    this.fn = fn
  }
  public run() {
    activeEffect = this // run的时候，每次更新activeEffect指向
    this.fn()
    // ! 重置
    activeEffect = void 0
  }
  /**
   * stop 方法，就是将 ReactiveEffect 上对应的副作用函数全部清除
   * runner.effect.stop() -> ReactiveEffectRunner.ReactiveEffect.stop()
   * stop 方法内的 this 为 ReactiveEffect 实例
   */
  public stop() {
    cleanupEffect(this)
  }
}

// /**
//  * TODO: 修复类型报错bug
//  * ? 源码此处：let activeEffect: ReactiveEffect | undefined
//  * ? 我这边按照源码方式初始化，`npm run test` 在 vitest 中测试无法通过，报类型错误
//  * ! 解决方式：必须 new ReactiveEffect(() => {}) 初始化赋值
//  */
// let activeEffect: ReactiveEffect | undefined = new ReactiveEffect(() => {})
let activeEffect: ReactiveEffect | undefined
let targetMap = new WeakMap() // 副作用映射树

/**
 * ? 源码为什么不直接返回 ReactiveEffect 实例对象
 * ? 猜测1：方便能从 targetMap 映射树中删除对应的 effectFn（相关代码：dep.delete(effect) ）
 * ? 猜测2：方便 stop 停止后能再次触发响应式？
 */
export function effect(fn: EffectFn) {
  let _effect = new ReactiveEffect(fn)
  _effect.run()
  let runner = _effect.fn.bind(_effect)
  // TODO: ts类型报错
  // @ts-ignore
  runner.effect = _effect
  return runner
}

// track dependencies
export function track(target: any, key: string | symbol | number) {
  if (activeEffect) {
    let depsMap = targetMap.get(target)
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()))
    }
    let dep = depsMap.get(key)
    if (!dep) {
      depsMap.set(key, (dep = new Set()))
    }
    dep.add(activeEffect)
    trackEffects(dep)
  }
}

// trigger effect
export function trigger(target: any, key: string | symbol | number) {
  let depsMap = targetMap.get(target)
  if (depsMap?.size) { // fix: vitest属性报错
    let dep = depsMap.get(key)
    dep.forEach((effect: ReactiveEffect) => {
      // if (effect !== activeEffect) { // 防止无限循环
        effect.run()
      // }
    })
  }
}

export function stop(runner: any) {
  runner.effect.stop()
}

function trackEffects(dep: any) {
  // console.log('activeEffect', activeEffect)
  // debugger
  // TODO: ts类型报错
  // @ts-ignore
  activeEffect.deps.push(dep)
}

// 清除副作用函数
function cleanupEffect(effect: ReactiveEffect) {
  // let { deps } = effect
  // if (deps.length) {
  //   deps.forEach((dep: Set<any>) => dep.delete(effect))
  //   deps.length = 0
  // }
  effect.deps.forEach((dep: Set<any>) => {
    dep.delete(effect)
  })
}
