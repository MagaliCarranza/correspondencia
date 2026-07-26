package com.magali.correspondencia.dto;

public record CrearUsuarioResponse(
        UsuarioResponse usuario,
        String passwordTemporal
) {}
