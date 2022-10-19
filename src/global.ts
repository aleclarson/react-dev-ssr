import { Context } from './context'

export const renderer = {
  immediateMode: false,
  /** The stack of currently executing components. */
  componentStack: [] as Function[],
  /** The stack of context defined by each component in the stack. */
  contextStack: [] as ([key: Context, value: any] | null)[],
}
