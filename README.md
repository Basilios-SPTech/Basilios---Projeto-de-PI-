# Basilio's — Projeto Integrador: Produtor e Consumidor (RabbitMQ)

## Integrantes

| Nome Completo | RA |
|---|---|
| _(preencher nome do integrante 1)_ | _(preencher RA)_ |
| _(preencher nome do integrante 2)_ | _(preencher RA)_ |

---

## Visão Geral

Este projeto implementa um sistema de **Produtor e Consumidor** usando **RabbitMQ** como broker de mensagens, aplicado ao contexto do restaurante Basilio's.

- **Produtor**: aplicação Java Spring Boot que expõe um endpoint `POST /pedido` e publica os pedidos na fila `pedidos` do RabbitMQ.
- **Consumidor**: aplicação Node.js (Express) que consome mensagens da fila `pedidos` e expõe um endpoint `GET /pedidos` para visualizar os pedidos recebidos.

---

## Como subir o ambiente

### Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/install/) instalados.

### Passo a passo

```bash
# 1. Clone o repositório (caso ainda não tenha feito)
git clone https://github.com/Basilios-SPTech/Basilios---Projeto-de-PI-.git
cd Basilios---Projeto-de-PI-

# 2. Suba todos os serviços (RabbitMQ, Produtor e Consumidor) em segundo plano
docker compose up -d --build

# 3. Aguarde todos os containers ficarem saudáveis (cerca de 30–60 s)
docker compose ps
```

Após a inicialização você terá:

| Serviço | URL |
|---|---|
| Produtor (Spring Boot) | http://localhost:8080 |
| Consumidor (Node.js) | http://localhost:3000 |
| RabbitMQ Management UI | http://localhost:15672 (usuário: `guest` / senha: `guest`) |

---

## Endpoint do Produtor — Publicar Pedido

### `POST http://localhost:8080/pedido`

**Headers:**

```
Content-Type: application/json
```

**Exemplo de corpo JSON:**

```json
{
  "cliente": "João Silva",
  "itens": ["X-Burguer", "Batata Frita", "Refrigerante"],
  "valorTotal": 45.90,
  "observacao": "Sem cebola no burguer"
}
```

**Exemplo de retorno esperado (HTTP 200):**

```json
{
  "status": "Pedido publicado com sucesso",
  "cliente": "João Silva"
}
```

**Exemplo com cURL:**

```bash
curl -X POST http://localhost:8080/pedido \
  -H "Content-Type: application/json" \
  -d '{
    "cliente": "João Silva",
    "itens": ["X-Burguer", "Batata Frita", "Refrigerante"],
    "valorTotal": 45.90,
    "observacao": "Sem cebola no burguer"
  }'
```

---

## Endpoint do Consumidor — Visualizar Pedidos

### `GET http://localhost:3000/pedidos`

Retorna todos os pedidos recebidos da fila desde que o serviço foi iniciado.

**Exemplo de retorno esperado (HTTP 200):**

```json
{
  "total": 1,
  "pedidos": [
    {
      "cliente": "João Silva",
      "itens": ["X-Burguer", "Batata Frita", "Refrigerante"],
      "valorTotal": 45.90,
      "observacao": "Sem cebola no burguer",
      "recebidoEm": "2025-01-01T12:00:00.000Z"
    }
  ]
}
```

**Exemplo com cURL:**

```bash
curl http://localhost:3000/pedidos
```

---

## Fluxo de Teste

1. **Suba os serviços:**
   ```bash
   docker compose up -d --build
   ```

2. **Envie um pedido via Produtor:**
   ```bash
   curl -X POST http://localhost:8080/pedido \
     -H "Content-Type: application/json" \
     -d '{"cliente":"Maria","itens":["Pizza Margherita"],"valorTotal":39.90,"observacao":""}'
   ```

3. **Consulte os pedidos no Consumidor:**
   ```bash
   curl http://localhost:3000/pedidos
   ```

4. **(Opcional) Acesse o painel do RabbitMQ** em http://localhost:15672 com usuário `guest` e senha `guest` para acompanhar as filas.

---

## Estrutura do Projeto

```
.
├── produtor/               # Java Spring Boot — Produtor
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
├── consumidor/             # Node.js (Express) — Consumidor
│   ├── index.js
│   ├── package.json
│   └── Dockerfile
├── basilios-auth-ui/       # Frontend React (Vite)
├── docker-compose.yml      # Orquestração dos serviços
└── README.md
```