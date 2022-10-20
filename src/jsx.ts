import { renderer } from './global'
import { mark } from './mark'
import { renderElement } from './render'
import { kElementType, kFragmentType, kJsxPropType } from './symbols'
import { Element, HtmlString } from './types'

export {
  markCallSite as jsxCallSite,
  renderChild as render,
  renderElement,
} from './render'

export const jsxProp = (get: any) => ({
  [kJsxPropType]: true,
  get,
})

export function jsx(
  type: string | Function,
  props: Record<string, any>,
  key: string | undefined,
  isStaticChildren: boolean,
  source: string,
  self: any
): Element | HtmlString {
  const element = mark({ type, props }, kElementType)
  return renderer.immediateMode ? renderElement(element) : element
}

// We don't treat static elements differently.
export const jsxs = jsx

export function Fragment(props: any): Element {
  return mark({ type: kFragmentType, props }, kElementType)
}
