import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import Header from './components/header';

function App() {
  return (
    <div>
      <Header />
      
      {/* Adicione padding-top para compensar o header fixo */}
      <main style={{ paddingTop: '120px' }}>
        {/* Seu conteúdo aqui */}
        
        {/* Exemplo de sections para testar o scroll */}
       
      </main>
    </div>
  );
}



export default App
