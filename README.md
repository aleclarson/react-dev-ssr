# react-dev-ssr

A custom JSX runtime + Babel transform that runs your React SSR code in a way that makes the stack trace actually useful. You can see every ancestor component and where the current component exists in its immediate parent.

## Usage

```
pnpm install react-dev-ssr
```

### Using with Vite

In your Vite config, add the following code:

```ts
import reactDevSSR from 'react-dev-ssr/vite'

export default defineConfig({
  plugins: [reactDevSSR()],
})
```

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
