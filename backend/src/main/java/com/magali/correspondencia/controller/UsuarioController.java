package com.magali.correspondencia.controller;

import com.magali.correspondencia.dto.ActualizarUsuarioRequest;
import com.magali.correspondencia.dto.CambiarPasswordRequest;
import com.magali.correspondencia.dto.CrearUsuarioRequest;
import com.magali.correspondencia.dto.CrearUsuarioResponse;
import com.magali.correspondencia.dto.MensajeroResponse;
import com.magali.correspondencia.dto.UsuarioResponse;
import com.magali.correspondencia.service.UsuarioService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/usuarios")
@PreAuthorize("hasRole('ADMIN')")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CrearUsuarioResponse crear(@Valid @RequestBody CrearUsuarioRequest request) {
        return usuarioService.crear(request);
    }

    @GetMapping
    public List<UsuarioResponse> listar() {
        return usuarioService.listar();
    }

    @PostMapping("/{id}/desbloquear")
    public UsuarioResponse desbloquear(@PathVariable Long id) {
        return usuarioService.desbloquear(id);
    }

    @PutMapping("/{id}")
    public UsuarioResponse actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarUsuarioRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        return usuarioService.actualizar(id, request, jwt.getSubject());
    }

    @PostMapping("/{id}/resetear-password")
    public CrearUsuarioResponse resetearPassword(@PathVariable Long id) {
        return usuarioService.resetearPassword(id);
    }

    @GetMapping("/mensajeros")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'RECEPCIONISTA')")
    public List<MensajeroResponse> listarMensajeros() {
        return usuarioService.listarMensajerosActivos();
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public UsuarioResponse miPerfil(@AuthenticationPrincipal Jwt jwt) {
        return usuarioService.obtenerPerfil(jwt.getSubject());
    }

    @PostMapping("/me/cambiar-password")
    @PreAuthorize("isAuthenticated()")
    public UsuarioResponse cambiarMiPassword(
            @Valid @RequestBody CambiarPasswordRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        return usuarioService.cambiarPassword(jwt.getSubject(), request);
    }
}
