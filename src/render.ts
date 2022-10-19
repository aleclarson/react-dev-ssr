import { ChildElement, Element } from './jsx'
import { kChildElement, kElementHtml } from './symbols'

export type RenderedElement = string & { [kElementHtml]: true }

export function render(element: ChildElement): ChildElement
export function render(element: Element): RenderedElement
export function render(element: Element | ChildElement): any {
  // Lazy rendered child element
  if (typeof element == 'function') {
    element[kChildElement] = true
    return element
  }
  if (typeof element.type == 'function') {
    const result = element.type(element.props)
    return result === null ? '' : result
  }
  // TODO: render a string
  let tag = `<${element.type}`
  for (let key in element.props) {
    if (key == 'children' || key == 'key' || key == 'ref') {
      continue
    }
    if (key == kDangerouslySetInnerHTML) {
      continue
    }
    if (key == 'className') {
      key = 'class'
    }
    const value = element.props[key]
    if (value === true) {
      tag += ` ${key}`
    } else if (value !== false && value !== undefined) {
      tag += ` ${key}="${value}"`
    }
  }
  const innerHtml = element.props[kDangerouslySetInnerHTML]
  if (innerHtml) {
    tag += `>` + innerHtml.__html
  } else {
    const children = toArray(element.props.children)
    if (children.length === 0) {
      if (VOID_TAGS[element.type]) {
        return `${tag}>`
      }
      return `${tag} />`
    }
    tag += `>`
    for (const child of children) {
      if (child === null || child === false) {
        continue
      }
      if (typeof child == 'function') {
        tag += render(child())
      } else if (child && child[kElementHtml]) {
        tag += child
      } else {
        tag += escapeHTML(String(child))
      }
    }
  }
  return `</ ${element.type}>`
}

const kDangerouslySetInnerHTML = 'dangerouslySetInnerHTML'

const VOID_TAGS = { img: 1, br: 1, hr: 1, meta: 1, link: 1, base: 1, input: 1 }

const toArray = <T>(
  arg: T
): (T extends readonly (infer U)[]
  ? Exclude<U, undefined>
  : Exclude<T, undefined>)[] =>
  arg !== undefined
    ? Array.isArray(arg)
      ? arg.filter(value => value !== undefined)
      : ([arg] as any)
    : []

const ESCAPE_CHARS: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
}
function escapeHTML(str: string): string {
  return str.replace(/[&<>]/g, c => ESCAPE_CHARS[c] || c)
}
