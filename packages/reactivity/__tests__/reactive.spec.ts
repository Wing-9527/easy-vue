import { 
  reactive,
  isReactive
} from '../src/reactive'

describe('reactivity/reactive', () => {
  test("reactive object", () => {
    const original = { foo: 1 };
    const observed = reactive(original);
    expect(observed).not.toBe(original);
    // get
    expect(observed.foo).toBe(1);
    // set
    observed.foo++
    expect(observed.foo).toBe(2)
    expect(original.foo).toBe(2)
    //     // has
    expect("foo" in observed).toBe(true);
    //     // ownKeys
    expect(Object.keys(observed)).toEqual(["foo"]);

    console.log('observed is reactive', observed.__v_isReactive)
  });
  test('it is should reaactive', () => {
    const original = { value: 1 };
    const observed = reactive(original);

    expect(isReactive(original)).toBe(undefined)
    expect(!!isReactive(original)).toBe(false)
    expect(isReactive(observed)).toBe(true)
  })
  test('nested reactive', () => {
    let raw = {
      nested: {
        name: '1'
      },
      list: [
        1,
        {
          p: 'p'
        }
      ]
    }

    let obs = reactive(raw)

    expect(isReactive(obs)).toBe(true)
    expect(isReactive(obs.nested)).toBe(true)
    expect(isReactive(obs.list)).toBe(true)
    expect(isReactive(obs.list[0])).toBe(undefined)
    expect(!!isReactive(obs.list[0])).toBe(false)
    expect(isReactive(obs.list[1])).toBe(true)
  })
})
