import { render } from 'react-dev-ssr'

function Foo(props) {
  return (
    <div className="a b c" role="hi">
      <Bar />
      <Bar>Hello {props.name}</Bar>
    </div>
  )
}

function Bar(props) {
  if (!props.children) {
    return null
  }
  return <span>{props.children}</span>
}

function Header() {
  return (
    <>
      <h1>Header</h1>
      <h2>Subheader</h2>
    </>
  )
}

render(<Foo name="Kobe" header={<Header />} />)
