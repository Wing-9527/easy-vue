import { createRenderer } from "@easy-vue/runtime-core"

// const rendererOptions = /*#__PURE__*/ extend({ patchProp }, nodeOps)
const rendererOptions = {} // 渲染器配置
let renderer: any // 渲染器

function ensureRenderer() {
  return (
    renderer ||
    (renderer = createRenderer(rendererOptions))
  )
}

// ! 入口
export const createApp = (...args: any[]) => {
  const app = ensureRenderer().createApp(...args)
  const { mount } = app
  // 重写mount方法
  app.mount = (): any => {
    const proxy = mount()
    return proxy
  }
  return app
}
