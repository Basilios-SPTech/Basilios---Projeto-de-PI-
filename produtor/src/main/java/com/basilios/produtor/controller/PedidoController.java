package com.basilios.produtor.controller;

import com.basilios.produtor.dto.PedidoDTO;
import com.basilios.produtor.service.PedidoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/pedido")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> publicarPedido(@Valid @RequestBody PedidoDTO pedido) {
        pedidoService.enviarPedido(pedido);
        return ResponseEntity.ok(Map.of(
                "status", "Pedido publicado com sucesso",
                "cliente", pedido.cliente()
        ));
    }
}
