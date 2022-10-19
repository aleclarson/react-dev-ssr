import { Context } from './context'
import { kContextInit } from './symbols'

/** The stack of currently executing components. */
export const componentStack: Function[] = []
/** The stack of context defined by each component in the stack. */
export const contextStack: ([key: Context, value: any] | null)[] = []

export function pushComponent(component: Function) {
  componentStack.push(component)
  contextStack.push(null)
}

export function popComponent() {
  componentStack.pop()
  contextStack.pop()
}

export function getContext(context: Context) {
  for (let i = componentStack.length - 1; i >= 0; i--) {
    const entry = contextStack[i]
    if (entry && entry[0] == context) {
      return entry[1]
    }
  }
  return context[kContextInit]
}

export function setContext(context: Context, value: any) {
  contextStack[contextStack.length - 1] = [context, value]
}
