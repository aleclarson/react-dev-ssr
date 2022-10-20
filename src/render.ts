import { renderer } from './global'
import { mark } from './mark'
import {
  kCallSiteType,
  kElementType,
  kFragmentType,
  kHtmlType,
  kJsxPropType,
} from './symbols'
import { Element, HtmlString, JSXCallSite } from './types'

export function renderToString(element: Element | JSXCallSite) {
  const result = isCallSite(element)
    ? renderCallSite(element)
    : renderElement(element)
  return result.html
}

/** @internal */
export function renderElement(element: Element | null): HtmlString {
  if (element === null) {
    return markHtml('')
  }
  const { type, props } = element
  if (typeof type == 'function') {
    const { immediateMode } = renderer
    renderer.immediateMode = false
    renderer.componentStack.push(type)
    renderer.contextStack.push(null)
    try {
      console.log('render component:', type.name)
      const result = type(props)
      if (result === null) {
        return markHtml('')
      }
      if (result[kHtmlType]) {
        return result
      }
      if (result[kElementType]) {
        // An element may be returned if the Babel transform cannot
        // determine if a return expression should be wrapped with a
        // `renderElement` call.
        return renderElement(result)
      }
      throw Error('Component returned an invalid value')
    } finally {
      renderer.immediateMode = immediateMode
      renderer.componentStack.pop()
      renderer.contextStack.pop()
    }
  }
  if (type == kFragmentType) {
    return renderFragment(props)
  }
  console.log('render html: %O', type)
  let tag = `<${type}`
  for (let key in props) {
    if (key == 'children' || key == 'key' || key == 'ref') {
      continue
    }
    if (key == kDangerouslySetInnerHTML) {
      continue
    }
    const value = props[key]
    if (key == 'className') {
      key = 'class'
    }
    if (value === true) {
      tag += ` ${key}`
    } else if (isHtmlValue(value)) {
      tag += ` ${key}="${escapeHtml(value)}"`
    }
  }
  if (VOID_TAGS[type]) {
    return markHtml(`${tag}>`)
  }
  const innerHtml = props[kDangerouslySetInnerHTML]
  if (innerHtml) {
    tag += `>` + innerHtml.__html
  } else {
    const children = toArray(props.children)
    if (children.length === 0) {
      return markHtml(`${tag} />`)
    }
    tag += `>` + renderChildren(children)
  }
  return markHtml(`${tag}</${type}>`)
}

/** @internal */
export function renderFragment(props: any) {
  return markHtml(renderChildren(toArray(props.children)))
}

function renderChildren(children: any[]) {
  let html = ''
  children.forEach((child, i) => {
    const childHtml = renderChild(child).html
    if (childHtml) {
      if (i > 0 && typeof children[i - 1] == 'string' && childHtml[0] !== '<') {
        html += '<!-- -->'
      }
      html += childHtml
    }
  })
  return html
}

/** @internal */
export function renderChild(child: any): HtmlString {
  if (child) {
    if (child[kJsxPropType]) {
      const { immediateMode } = renderer
      renderer.immediateMode = false
      child = child.get()
      renderer.immediateMode = immediateMode
      return renderChild(child)
    }
    if (child[kElementType]) {
      return renderElement(child)
    }
    if (isCallSite(child)) {
      return renderCallSite(child)
    }
    if (child[kHtmlType]) {
      return child
    }
    if (Array.isArray(child)) {
      return markHtml(renderChildren(child))
    }
  }
  if (child === null || child === false) {
    return markHtml('')
  }
  return markHtml(escapeHtml(child))
}

/** @internal */
export function markCallSite(renderFn: Function): JSXCallSite {
  return mark(renderFn, kCallSiteType) as any
}

const isCallSite = (value: any): value is JSXCallSite => !!value[kCallSiteType]

function renderCallSite(render: JSXCallSite): HtmlString {
  if (renderer.immediateMode) {
    return render()
  }
  renderer.immediateMode = true
  try {
    return render()
  } finally {
    renderer.immediateMode = false
  }
}

const markHtml = (html: string): HtmlString =>
  mark({ html, toString: unwrapHtml }, kHtmlType) as any

function unwrapHtml(this: HtmlString) {
  return this.html
}

const kDangerouslySetInnerHTML = 'dangerouslySetInnerHTML'

const VOID_TAGS: Record<string, 1 | undefined> = {
  img: 1,
  br: 1,
  hr: 1,
  meta: 1,
  link: 1,
  base: 1,
  input: 1,
}

function isHtmlString(value: any): value is HtmlString {
  return !!value[kHtmlType]
}

function isHtmlValue(value: any) {
  return (
    value !== false &&
    value !== undefined &&
    typeof value !== 'function' &&
    (typeof value !== 'object' || value.toString !== Object.prototype.toString)
  )
}

const ESCAPE_CHARS: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
}
function escapeHtml(value: any): string {
  return String(value).replace(/[&<>"']/g, c => ESCAPE_CHARS[c])
}

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
