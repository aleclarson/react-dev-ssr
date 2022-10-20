import { renderer } from './global'
import { useContext } from './hooks'
import { Fragment } from './jsx'
import { renderElement } from './render'
import { kContextId, kContextInit } from './symbols'

export interface Context {
  [kContextId]: number
  [kContextInit]: any
  Provider: any
  Consumer: any
}

let nextId = 1

export function createContext(init?: any) {
  const context: Context = {
    [kContextId]: nextId++,
    [kContextInit]: init,
    Provider,
    Consumer,
  }
  function Provider(props: { value: any; children: any }) {
    renderer.contextStack[renderer.contextStack.length - 1] = [
      context,
      props.value,
    ]
    return renderElement(Fragment(props))
  }
  function Consumer(props: { children: (value: any) => any }) {
    return props.children(useContext(context))
  }
  return context
}
