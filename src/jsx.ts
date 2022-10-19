import { RenderedElement } from './render'
import { kChildElement } from './symbols'

export type Element = {
  type: string | Function
  props: ElementProps
}

export type ElementProps = Record<string, any> & { children?: Children }

export type Children =
  | Children[]
  | ChildElement
  | RenderedElement
  | string
  | number
  | boolean
  | null
  | undefined

export type ChildElement = (() => Element) & {
  [kChildElement]: true
}

export function jsx(
  type: string | Function,
  props: Record<string, any>,
  key: string | undefined,
  isStaticChildren: boolean,
  source: string,
  self: any
) {
  return { type, props }
}
