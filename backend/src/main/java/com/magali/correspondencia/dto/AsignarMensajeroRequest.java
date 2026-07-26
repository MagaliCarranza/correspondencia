package com.magali.correspondencia.dto;

import jakarta.validation.constraints.NotNull;

public record AsignarMensajeroRequest(
        @NotNull Long mensajeroId
) {}
