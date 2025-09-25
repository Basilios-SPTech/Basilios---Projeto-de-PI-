import { useState } from 'react'
import ProductRegistration from './cadastrarProduto'  
import './App.css'

function App() {
  const [count, setCount] = useState(0) 

  return (
    <>
      <ProductRegistration />  {/* Renderiza o formulário de cadastro */}
    </>
  )
}

export default App