/**
 * @file 虚拟dom
 */
import { ShapeFlags, isString } from "@easy-vue/shared"

export const createVNode =  _createVNode // ! 源码此处三元运算符判断是否为开发环境
export const Fragment = Symbol(void 0)

function _createVNode(
  type: any,
  props: any = null,
  children: unknown = null,
  patchFlag: number = 0,
  dynamicProps: string[] | null = null,
  isBlockNode = false
) {
  
  // ! 如果 type 是 vnode，返回克隆的 vnode
  // ! （type 规范化）如果是类组件，修改 type
  // ! （props 规范化）修改 props.class 和 props.style
  // ! 修改 shapeFlag
  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    // : __FEATURE_SUSPENSE__ && isSuspense(type)
    // ? ShapeFlags.SUSPENSE
    // : isTeleport(type)
    // ? ShapeFlags.TELEPORT
    // : isObject(type)
    // ? ShapeFlags.STATEFUL_COMPONENT
    // : isFunction(type)
    // ? ShapeFlags.FUNCTIONAL_COMPONENT
    : 0

  return createBaseVNode(
    type,
    props,
    children,
    patchFlag,
    dynamicProps,
    shapeFlag,
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
  shapeFlag = type === Fragment ? 0 : ShapeFlags.ELEMENT,
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
    shapeFlag,
    patchFlag,
    dynamicProps,
    dynamicChildren: null,
    appContext: null
  }

  return vnode
}
