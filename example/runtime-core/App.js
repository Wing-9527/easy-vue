import { h } from "vitest/dist/index-1e9f7f83"

export const App = {
  render() {
    return h("div", "hi, " + this.msg)
  },
  setup() {
    return {
      msg: "mini-vue"
    }
  }
}