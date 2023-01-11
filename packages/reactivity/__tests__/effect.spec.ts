import { reactive } from "../src/reactive"
import { effect } from "../src/effect"

describe('reactivity/effect', () => {
  test('effect track and trigger', () => {
    let user = reactive({
      age: 10
    })

    let nextAge
    effect(() => {
      nextAge = user.age + 1
      console.log('trigger');
      // debugger
    })

    // debugger

    expect(nextAge).toBe(11)
    // update
    user.age++
    // debugger
    expect(nextAge).toBe(12)
  })
  test('should return runner when call effect', () => {
    let rawData = {
      count: 1
    }

    let observerData = reactive(rawData)

    let tempCount

    let runner = effect(() => {
      // let innerCount = observerData.count++ // TODO: infinite loop bug
      tempCount = observerData.count + 1
      return 'noob'
    })

    expect(tempCount).toBe(2)

    observerData.count++
    expect(observerData.count).toBe(2)
    expect(rawData.count).toBe(2)
    expect(tempCount).toBe(3)

    /**
     * ? is same ref
     * observerData == rawData
     */
    expect(observerData).not.toBe(rawData)

    let runnerRes = runner()
    expect(runnerRes).toBe('noob')
  })
})