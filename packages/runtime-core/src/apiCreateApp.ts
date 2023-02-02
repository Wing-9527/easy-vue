/**
 * @file 创建 createApp 文件
 */

import { createVNode } from "./vnode"

export function createAppAPI(
  render: (...args: any[]) => any,
  hydrate?: unknown
) {
  return function createApp(rootComponent: unknown, rootProps: unknown = null) {
    
    let isMounted = false
    
    let app = {
      _component: rootComponent,
      _props: rootProps,
      mount(
        rootContainer: HTMLElement | string,
        isHydrate?: boolean,
        isSVG?: boolean
      ): any {
        if (!isMounted) {
          let vnode = createVNode(rootComponent, rootProps)
          render(vnode, rootContainer, isSVG)
        }
      }
    }

    return app
  }
}
