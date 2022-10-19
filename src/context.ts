import { getContext, setContext } from './global'
import { render } from './render'
import { kContextId, kContextInit } from './symbols'

export interface Context {
  [kContextId]: number
  [kContextInit]: any
  Provider: any
  Consumer: any
}

let nextId = 1

export function createContext(init?: any) {
  const context = {
    [kContextId]: nextId++,
    [kContextInit]: init,
    Provider,
    Consumer,
  }
  function Provider(props: { value: any; children: any }) {
    setContext(context, props.value)
    return render(props.children)
  }
  function Consumer(props: { children: (value: any) => any }) {
    return render(props.children(getContext(context)))
  }
}
