package com.basilios.produtor.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.List;

public record PedidoDTO(
        @NotBlank(message = "O nome do cliente é obrigatório")
        String cliente,

        @NotNull(message = "A lista de itens é obrigatória")
        List<@NotBlank String> itens,

        @Positive(message = "O valor total deve ser positivo")
        BigDecimal valorTotal,

        String observacao
) {}
