/**
 * @file 虚拟dom
 */

export const createVNode =  _createVNode // ! 源码此处三元运算符判断开发环境

function _createVNode(
  type: any,
  props: any,
  children: unknown = null,
  patchFlag: number = 0,
  dynamicProps: string[] | null = null,
  isBlockNode = false
) {
  // return createBaseVNode()
}

// function createBaseVNode() {}
