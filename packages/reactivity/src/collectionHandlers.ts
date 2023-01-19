export const mutableCollectionHandlers: ProxyHandler<any> = {
  // get: /*#__PURE__*/ createInstrumentationGetter(false, false)
}

export const readonlyCollectionHandlers: ProxyHandler<any> = {}

export const shallowReadonlyCollectionHandlers: ProxyHandler<any> = {}
