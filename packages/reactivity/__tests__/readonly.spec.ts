import { vi } from "vitest";
import {
  readonly,
  isReadonly
} from "../src/reactive";

describe('reactivity/readonly', () => {
  test('is attached setter', () => {
    console.warn = vi.fn(() => {
      console.log('readonly setter: 触发')
    })
    
    let rnObj = readonly({
      value: 1
    })

    rnObj.obj++
    expect(console.warn).toHaveBeenCalledTimes(1)
    rnObj.obj++
    expect(console.warn).toHaveBeenCalledTimes(2)
  })
  test('readonly object', () => {
    let readonlyPen = readonly({
      product: 'pen',
      count: 100
    })

    expect(readonlyPen.count).toBe(100)
    // update
    readonlyPen.count--
    expect(readonlyPen.count).toBe(100)
  })
  test('it is should readonly', () => {
    let rnObj = readonly({
      value: 1
    })

    rnObj.value = 2 // ! should console warn

    expect(isReadonly(rnObj)).toBe(true)
  })
})
