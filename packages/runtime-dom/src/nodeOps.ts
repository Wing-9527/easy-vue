export const nodeOps = {
  insert: (child: HTMLElement, parent: HTMLElement, anchor: any) => {
    parent.insertBefore(child, anchor || null)
  },

  createElement: (tag: string, isSVG: boolean, is: boolean, props: object): HTMLElement => {
    const el = document.createElement(tag)
    return el
  }
}