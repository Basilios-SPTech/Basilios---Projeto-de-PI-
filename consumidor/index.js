const amqp = require('amqplib');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const QUEUE_NAME = 'pedidos';

const pedidosRecebidos = [];

async function conectarRabbitMQ() {
  let tentativas = 0;
  const maxTentativas = 10;
  const intervaloMs = 5000;

  while (tentativas < maxTentativas) {
    try {
      const conexao = await amqp.connect(RABBITMQ_URL);
      const canal = await conexao.createChannel();
      await canal.assertQueue(QUEUE_NAME, { durable: true });

      console.log(`[Consumidor] Aguardando mensagens na fila "${QUEUE_NAME}"...`);

      canal.consume(QUEUE_NAME, (msg) => {
        if (msg !== null) {
          const conteudo = JSON.parse(msg.content.toString());
          const pedido = {
            ...conteudo,
            recebidoEm: new Date().toISOString(),
          };
          pedidosRecebidos.push(pedido);
          console.log('[Consumidor] Pedido recebido:', pedido);
          canal.ack(msg);
        }
      });

      conexao.on('error', (err) => {
        console.error('[Consumidor] Erro na conexão RabbitMQ:', err.message);
      });

      return;
    } catch (err) {
      tentativas++;
      console.error(
        `[Consumidor] Tentativa ${tentativas}/${maxTentativas} - Falha ao conectar ao RabbitMQ: ${err.message}`
      );
      if (tentativas < maxTentativas) {
        await new Promise((resolve) => setTimeout(resolve, intervaloMs));
      } else {
        console.error('[Consumidor] Não foi possível conectar ao RabbitMQ. Encerrando.');
        process.exit(1);
      }
    }
  }
}

app.get('/pedidos', (req, res) => {
  res.json({
    total: pedidosRecebidos.length,
    pedidos: pedidosRecebidos,
  });
});

app.listen(PORT, () => {
  console.log(`[Consumidor] Servidor HTTP rodando em http://localhost:${PORT}`);
  conectarRabbitMQ();
});
