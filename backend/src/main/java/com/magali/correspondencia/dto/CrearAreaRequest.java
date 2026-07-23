package com.magali.correspondencia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CrearAreaRequest(
        @NotBlank @Size(max = 80) String nombre
) {}
