/**
 * @file 虚拟dom
 */

export const createVNode =  _createVNode // ! 源码此处三元运算符判断是否为开发环境

function _createVNode(
  type: any,
  props: any,
  children: unknown = null,
  patchFlag: number = 0,
  dynamicProps: string[] | null = null,
  isBlockNode = false
) {
  return createBaseVNode(
    type,
    props,
    children,
    patchFlag,
    dynamicProps,
    // shapeFlag,
    isBlockNode,
    true
  )
}

function createBaseVNode(
  type: any,
  props: any,
  children: unknown = null,
  patchFlag = 0,
  dynamicProps: string[] | null = null,
  // shapeFlag = type === Fragment ? 0 : ShapeFlags.ELEMENT,
  isBlockNode = false,
  needFullChildrenNormalization = false
) {
  const vnode = {
    __v_isVNode: true,
    __v_skip: true,
    type,
    props,
    // key: props && normalizeKey(props),
    // ref: props && normalizeRef(props),
    // scopeId: currentScopeId,
    slotScopeIds: null,
    children,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetAnchor: null,
    staticCount: 0,
    // shapeFlag,
    patchFlag,
    dynamicProps,
    dynamicChildren: null,
    appContext: null
  }

  return vnode
}
