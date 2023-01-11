import { reactive } from '../src/reactive'

describe('reactivity/reactive', () => {
  test("Object", () => {
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
})
