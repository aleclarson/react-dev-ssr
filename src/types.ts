import {
  kCallSiteType,
  kFragmentType,
  kHtmlType,
  kJsxPropType,
} from './symbols'

export type HtmlString = {
  [kHtmlType]: true
  html: string
}

export type Element = {
  type: string | Function | typeof kFragmentType
  props: ElementProps
}

export type ElementProps = Record<string, any> & { children?: Children }

export type Children =
  | Children[]
  | JSXCallSite
  | HtmlString
  | string
  | number
  | boolean
  | null
  | undefined

export type JSXCallSite = (() => HtmlString) & {
  [kCallSiteType]: true
}

export type JSXProp = {
  [kJsxPropType]: true
  get: () => any
}
