import { Context } from './context'
import { getContext } from './global'

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
  return getContext(context)
}

export const useEffect = noop
export const useLayoutEffect = noop
