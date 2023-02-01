import { createRenderer } from "@easy-vue/runtime-core"

let renderer: any // 渲染器

function ensureRenderer(rendererOptions: object) {
  return (
    renderer ||
    (renderer = createRenderer(rendererOptions))
  )
}
