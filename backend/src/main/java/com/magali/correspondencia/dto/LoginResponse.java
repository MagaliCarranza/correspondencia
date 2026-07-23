package com.magali.correspondencia.dto;

public record LoginResponse(
        String token,
        String username,
        String nombreCompleto,
        String rol,
        String area,
        boolean debeCambiarPassword
) {}
