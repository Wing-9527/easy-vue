/**
 * @file 渲染器
 */

import { createAppAPI } from "./apiCreateApp"

export function createRenderer(options: any) {
  return baseCreateRenderer(options)
}

function baseCreateRenderer(options: any) {
  // patch
  const patch = () => {}

  // unmount
  const unmount = () => {}
  // patchComponent
  // ...
  const render = (vnode: unknown, container: unknown, isSVG: boolean) => {}
  let hydrate: any
  return {
    render,
    hydrate,
    createApp: createAppAPI(render, hydrate)
  }
}
