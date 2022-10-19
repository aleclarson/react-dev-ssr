import { Context } from './context'
import { renderer } from './global'
import { kContextInit } from './symbols'

const noop = () => {}

export function useState(init: any) {
  const state = typeof init == 'function' ? init() : init
  return [state, noop]
}

export function useRef(init: any) {
  return { current: init }
}

export function useMemo(get: any) {
  return get()
}

export function useContext(context: Context) {
  for (let i = renderer.componentStack.length - 1; i >= 0; i--) {
    const entry = renderer.contextStack[i]
    if (entry && entry[0] == context) {
      return entry[1]
    }
  }
  return context[kContextInit]
}

export const useEffect = noop
export const useLayoutEffect = noop
