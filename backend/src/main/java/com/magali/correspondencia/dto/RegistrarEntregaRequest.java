package com.magali.correspondencia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegistrarEntregaRequest(
        @NotBlank @Size(max = 120) String nombreRecibe,
        @Size(max = 500) String observacionesEntrega
) {}
