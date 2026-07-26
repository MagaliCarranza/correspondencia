package com.magali.correspondencia.dto;

import jakarta.validation.constraints.Size;

public record ArchivarRequest(
        @Size(max = 500) String motivo
) {}
