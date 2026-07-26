package com.magali.correspondencia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AnularRequest(
        @NotBlank @Size(max = 500) String motivo
) {}
