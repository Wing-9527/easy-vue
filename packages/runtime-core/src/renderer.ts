/**
 * @file 渲染器
 */

import { createAppAPI } from "./apiCreateApp"
import { Fragment, Text, Comment, Static } from "./vnode"
import { ShapeFlags } from "@easy-vue/shared"

export function createRenderer(options: any) {
  return baseCreateRenderer(options)
}

function baseCreateRenderer(options: any) {
  const {
    insert: hostInsert,
    createElement: hostCreateElement,
  } = options

  const patch = (
    n1: any,
    n2: any,
    container: HTMLElement,
    anchor = null,
    parentComponent = null,
    parentSuspense = null,
    isSVG = false,
    slotScopeIds = null,
    optimized = false
  ) => {
    if (n1 === n2) {
      return
    }

    const { type, ref, shapeFlag } = n2
    switch (type) {
      case Text:
      case Comment:
      case Static:
      case Fragment:
        break
      default: 
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(
          n1,
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          isSVG,
          slotScopeIds,
          optimized
        )
      }
    }
  }

  // ! 处理标签
  const processElement = (
    n1: any,
    n2: any,
    container: any,
    anchor: any,
    parentComponent: any,
    parentSuspense: any,
    isSVG: boolean,
    slotScopeIds: string[] | null,
    optimized: boolean
  ) => {
    /**
     * ! 例如：
     *    初始化时，节点并不存在，此时 n1 为空，只需要挂载节点就行
     *    否则调用 patchElement 进行对比打补丁
     */
     if (n1 == null) {
      mountElement(
        n2,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        isSVG,
        slotScopeIds,
        optimized
      )
    } else {
      patchElement(
        n1,
        n2,
        parentComponent,
        parentSuspense,
        isSVG,
        slotScopeIds,
        optimized
      )
    }
  }

  // ! 处理标签，挂载
  const mountElement = (
    vnode: any,
    container: HTMLElement,
    anchor: any,
    parentComponent: any,
    parentSuspense: any,
    isSVG: boolean,
    slotScopeIds: string[] | null,
    optimized: boolean
  ) => {
    let el: HTMLElement
    const { type, props, shapeFlag, transition, patchFlag, dirs } = vnode

    el = vnode.el = hostCreateElement( // ! 创建元素节点
        vnode.type as string,
        isSVG,
        props && props.is,
        props
      )

    // ! 插入节点
    hostInsert(el, container, anchor)
  }

  // ! 处理标签，对比
  const patchElement = (
    n1: any,
    n2: any,
    parentComponent: any,
    parentSuspense: any,
    isSVG: boolean,
    slotScopeIds: string[] | null,
    optimized: boolean
  ) => {}

  const render = (vnode: unknown, container: unknown, isSVG: boolean) => {}

  let hydrate: any

  return {
    render,
    hydrate,
    createApp: createAppAPI(render, hydrate)
  }
}
