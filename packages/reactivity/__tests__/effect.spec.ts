import { reactive } from "../src/reactive"
import { effect, stop } from "../src/effect"

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
  test('effect stop', () => {
    let outterCount = null

    let reactiveData = reactive({
      count: 1
    })

    let runner = effect(() => {
      outterCount = reactiveData.count + 1
      console.log('stop attached')
    })

    expect(outterCount).toBe(2)
    reactiveData.count++
    expect(outterCount).toBe(3)
    reactiveData.count++
    expect(outterCount).toBe(4)

    // stop effect
    stop(runner)
    reactiveData.count++
    expect(outterCount).toBe(4)

    // ! restar
    // runner()
    // @ts-ignore
    runner.effect.run()
    expect(outterCount).toBe(5)
  })
  it("stop", () => {
    let dummy;
    const obj = reactive({ prop: 1 });
    const runner = effect(() => {
      dummy = obj.prop;
    });
    obj.prop = 2;
    expect(dummy).toBe(2);
    stop(runner);
    // obj.prop = 3
    obj.prop++;
    expect(dummy).toBe(2);

    // stopped effect should still be manually callable
    runner();
    expect(dummy).toBe(3);
  });
})