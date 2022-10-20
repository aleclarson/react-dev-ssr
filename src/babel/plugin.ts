import * as babel from '@babel/core'
import { types as t } from '@babel/core'

type State = {
  imports: Set<string>
}

export default function (): babel.PluginObj<State> {
  const added = new Set()
  return {
    name: '',
    visitor: {
      Program: {
        enter(path, state) {
          state.imports = new Set()
          path.traverse({
            Function(path) {
              const jsxElements: babel.NodePath[] = []
              path.traverse({
                Function(path) {
                  path.skip()
                },
                JSXElement(path) {
                  jsxElements.push(path)
                  path.skip()
                },
                JSXFragment(path) {
                  jsxElements.push(path)
                  path.skip()
                },
              })
              if (jsxElements.length) {
                path.traverse({
                  Function(path) {
                    path.skip()
                  },
                  ReturnStatement(path) {
                    const returned = path.get('argument')
                    if (!returned.node) {
                      return
                    }
                    if (jsxElements.some(elem => elem.isDescendant(path))) {
                      state.imports.add('_renderElement')
                      const wrapper = t.callExpression(
                        t.identifier('_renderElement'),
                        [returned.node]
                      )
                      copyLocation(wrapper, returned)
                      returned.replaceWith(wrapper)
                    }
                  },
                })
              }
            },
          })
        },
        exit(path, state) {
          for (const name of state.imports) {
            path.node.body.unshift(
              t.importDeclaration(
                [
                  t.importSpecifier(
                    t.identifier(name),
                    t.identifier(name.slice(1))
                  ),
                ],
                t.stringLiteral('react-dev-ssr/jsx-runtime')
              )
            )
          }
        },
      },
      JSXElement(path, state) {
        const nearestJSXParent = path.findParent(
          p =>
            p.isJSXElement() ||
            p.isJSXOpeningElement() ||
            p.isJSXFragment() ||
            p.isCallExpression() ||
            p.isFunction()
        )
        if (!nearestJSXParent) {
          return
        }
        if (nearestJSXParent.isFunction()) {
          return
        }
        if (nearestJSXParent.isJSXOpeningElement()) {
          return // Element props are not callsites.
        }

        const tagName = path.get('openingElement').get('name')
        const isNativeTag =
          tagName.isJSXIdentifier() && /[a-z]/.test(tagName.node.name[0])

        if (!isNativeTag) {
          state.imports.add('_jsxCallSite')
          path.replaceWith(wrapCallSite(path))
          // path.skip()
        }
      },
      JSXExpressionContainer(path, state) {
        let expr = path.get('expression')
        if (expr.isJSXEmptyExpression()) {
          return
        }

        const nearestJSXParent = path.findParent(
          p => p.isJSXElement() || p.isJSXOpeningElement() || p.isJSXFragment()
        )
        if (!nearestJSXParent) {
          return
        }

        let isJSXExpr = expr.isJSXElement() || expr.isJSXFragment()

        if (nearestJSXParent.isJSXOpeningElement()) {
          isJSXExpr ||
            expr.traverse({
              Function(path) {
                path.stop()
              },
              JSXElement(path) {
                isJSXExpr = true
                path.stop()
              },
              JSXFragment(path) {
                isJSXExpr = true
                path.stop()
              },
            })

          if (!isJSXExpr) {
            return
          }

          state.imports.add('_jsxProp')
          expr = expr.replaceWith(
            t.callExpression(t.identifier('_jsxProp'), [
              t.arrowFunctionExpression([], expr.node as t.Expression),
            ])
          )[0]

          copyLocation(expr.node, path)
          return
        }

        // Transform non-element children only.
        if (isJSXExpr) {
          return
        }

        expr = expr.replaceWith(wrapCallSite(expr))[0]
        const [renderFn] = (expr as babel.NodePath<t.CallExpression>).get(
          'arguments'
        )
        renderFn.traverse({
          Function(path) {
            path.skip()
          },
          ReturnStatement(path) {
            const returned = path.get('argument')
            if (!returned.node) {
              return
            }
            state.imports.add('_render')
            const wrapper = t.callExpression(t.identifier('_render'), [
              returned.node,
            ])
            copyLocation(wrapper, returned)
            returned.replaceWith(wrapper)
          },
        })
        expr.skip()
      },
    },
  }
}

function wrapCallSite(path: babel.NodePath) {
  const wrapperFn = t.arrowFunctionExpression(
    [],
    t.blockStatement([t.returnStatement(path.node as t.Expression)])
  )
  const wrapper = t.callExpression(t.identifier('_jsxCallSite'), [wrapperFn])
  copyLocation(wrapperFn, path)
  copyLocation(wrapper, path)
  return wrapper
}

function copyLocation(
  node: babel.Node,
  path: babel.NodePath<t.Node | null | undefined>
): void {
  if (!path.node) return
  node.loc = path.node.loc
  node.start = path.node.start
  node.end = path.node.end
}
