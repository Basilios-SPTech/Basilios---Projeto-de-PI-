import { useState, useEffect } from 'react';

export default function Data() {
  const [dataAtual, setDataAtual] = useState(new Date());

  // Se quiser atualizar a cada segundo é só descomentar <3
  useEffect(() => {
    const timer = setInterval(() => {
      setDataAtual(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      {dataAtual.toLocaleDateString('pt-BR')} - {dataAtual.toLocaleTimeString('pt-BR')}
    </div>
  );
}