/**
 * @file h方法
 */

import { createVNode } from "./vnode";

export function h(type: any, propsOrChildren?: any, children?: any) {
  return createVNode(type, propsOrChildren, children)
}
