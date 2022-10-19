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
  if (isCallSite(element)) {
    return renderCallSite(element).html
  }
  return render(element).html
}

export function render(element: Element | HtmlString | null): HtmlString {
  if (element === null) {
    return markHtml('')
  }
  if (isHtmlString(element)) {
    // If immediate mode is on, calling render on the returned value may
    // give us a rendered element.
    return element
  }
  const { type, props } = element
  if (typeof type == 'function') {
    renderer.componentStack.push(type)
    renderer.contextStack.push(null)
    try {
      const result = type(props)
      if (result === null) {
        return markHtml('')
      }
      if (result[kHtmlType]) {
        return result
      }
      if (result[kElementType]) {
        // TODO: this shouldn't happen, but it does
        return render(result)
      }
      throw Error('Component returned an invalid value')
    } finally {
      renderer.componentStack.pop()
      renderer.contextStack.pop()
    }
  }
  if (type == kFragmentType) {
    const childrenHtml = toArray(props.children).map(renderChild)
    return markHtml(childrenHtml.join(''))
  }
  let tag = `<${type}`
  for (let key in props) {
    if (key == 'children' || key == 'key' || key == 'ref') {
      continue
    }
    if (key == kDangerouslySetInnerHTML) {
      continue
    }
    if (key == 'className') {
      key = 'class'
    }
    const value = props[key]
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
    tag += `>`
    for (const child of children) {
      const childHtml = renderChild(child)
      tag += childHtml
    }
  }
  return markHtml(`${tag}</${type}>`)
}

export function renderIfElement(value: any) {
  if (value) {
    if (value[kElementType]) {
      return render(value)
    }
    if (isCallSite(value)) {
      return renderCallSite(value)
    }
    if (value[kJsxPropType]) {
      renderer.immediateMode = false
      value = value.get()
      renderer.immediateMode = true
    }
  }
  return value
}

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

function renderChild(child: any): string | HtmlString {
  child = renderIfElement(child)
  if (child && child[kHtmlType]) {
    return child.html
  }
  if (child === null || child === false) {
    return ''
  }
  return escapeHtml(child)
}

const markHtml = (html: string): HtmlString => mark({ html }, kHtmlType) as any

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
