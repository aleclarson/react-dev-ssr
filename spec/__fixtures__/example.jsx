import {
  renderToString,
  useState,
  createContext,
  useContext,
} from 'react-dev-ssr'

function App(props) {
  return (
    <>
      <div>{props.header}</div>
      <main>
        <Container />
        <Container>Hello {props.name}</Container>
        <InitialCount.Provider value={100}>
          <Container>
            <Counter />
          </Container>
        </InitialCount.Provider>
      </main>
    </>
  )
}

function Container(props) {
  if (!props.children) {
    return null
  }
  return <div>{props.children}</div>
}

const InitialCount = createContext(0)

function Counter() {
  const initialCount = useContext(InitialCount)
  const [count, setCount] = useState(initialCount)
  const decrement = <button onClick={() => setCount(count - 1)}>-</button>
  const increment = <button onClick={() => setCount(count + 1)}>+</button>
  return (
    <div className="flex flex-row">
      {decrement}
      <span>Count: {count}</span>
      {increment}
    </div>
  )
}

function Header() {
  return (
    <header>
      <h1>Header</h1>
      <h2>Subheader</h2>
    </header>
  )
}

export default renderToString(
  <InitialCount.Provider value={0}>
    <App name="Kobe" header={<Header />} />
  </InitialCount.Provider>
)
