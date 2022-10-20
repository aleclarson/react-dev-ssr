# react-dev-ssr

A custom JSX runtime + Babel transform that runs your React SSR code in a way that makes the stack trace actually useful. You can see every ancestor component and where the current component exists in its immediate parent.

## How it works

Every JSX element using a custom component is wrapped with the `jsxCallSite` function from `react-dev-ssr/jsx-runtime` module. This wraps the element with a closure, creating a stack frame where the element was declared. Since the `react-dev-ssr` runtime is synchronous, you will which JSX elements led to the invocation of the current stack of components being rendered.

Every JSX child expression is also wrapped with `jsxCallSite`, so you can see where exactly each component was declared inside its parent component.

Since the `react-dev-ssr` runtime only runs on the server, it doesn't need to implement any concept of re-rendering. This allows for a drastically simplified runtime. Many of React's features are no-ops on the server (eg: `useEffect`, `React.memo`, etc).

## Help wanted

This is a work-in-progress. Many React features are missing that you might be using. If you find a missing feature, please open an issue or PR. **If your React app is relatively basic, this package should work just fine!**

- Suspense
- Class components
- `cloneElement`
- `isValidElement`
- `React.Children`
- `React.lazy`
- `useReducer`
- `useId`

## Usage

```
pnpm install react-dev-ssr
```

### Using with Vite

In your Vite config, add the following code:

```ts
import reactDevSSR from 'react-dev-ssr/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), reactDevSSR()],
})
```

> **Warning**
> Vite support is pending a PR to Vite:
> https://github.com/vitejs/vite/pull/10552

### Using with Babel

In your Babel config, add the following to your plugins array:

```ts
'react-dev-ssr/jsx-transform'
```

You also need to swap out `react` and `react-dom/server` imports with `react-dev-ssr`. The bundler you're using will determine how this is done.

- **Webpack**  
  Use the [`resolve.alias`](https://webpack.js.org/configuration/resolve/#resolvealias) built-in option.

- **Parcel**  
  Use the ["Package Aliases"](https://parceljs.org/features/dependency-resolution/#aliases) built-in feature.

- **Rollup**  
  Use the [`@rollup/plugin-alias`](https://www.npmjs.com/package/@rollup/plugin-alias) plugin.

- **ESBuild**  
  Use the [`esbuild-plugin-alias`](https://github.com/igoradamenko/esbuild-plugin-alias) plugin.

- **Babel**  
  If you're not using a bundler, you can try using the [`babel-plugin-import-replacement`](https://github.com/BuggMaker/babel-plugin-import-replacement) plugin.
