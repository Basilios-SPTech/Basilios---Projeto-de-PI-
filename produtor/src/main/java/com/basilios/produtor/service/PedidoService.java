package com.basilios.produtor.service;

import com.basilios.produtor.config.RabbitMQConfig;
import com.basilios.produtor.dto.PedidoDTO;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class PedidoService {

    private final RabbitTemplate rabbitTemplate;

    public PedidoService(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void enviarPedido(PedidoDTO pedido) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.QUEUE_PEDIDOS, pedido);
    }
}
