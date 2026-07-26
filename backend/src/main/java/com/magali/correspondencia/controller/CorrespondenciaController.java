package com.magali.correspondencia.controller;

import com.magali.correspondencia.dto.AnularRequest;
import com.magali.correspondencia.dto.ArchivarRequest;
import com.magali.correspondencia.dto.AsignarMensajeroRequest;
import com.magali.correspondencia.dto.CorrespondenciaResponse;
import com.magali.correspondencia.dto.CrearCorrespondenciaRequest;
import com.magali.correspondencia.dto.FiltrosCorrespondencia;
import com.magali.correspondencia.dto.RegistrarEntregaRequest;
import com.magali.correspondencia.model.EstadoCorrespondencia;
import com.magali.correspondencia.service.CorrespondenciaService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/correspondencia")
public class CorrespondenciaController {

    private final CorrespondenciaService correspondenciaService;

    public CorrespondenciaController(CorrespondenciaService correspondenciaService) {
        this.correspondenciaService = correspondenciaService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('RECEPCIONISTA', 'ADMIN')")
    public CorrespondenciaResponse registrar(@Valid @RequestBody CrearCorrespondenciaRequest request,
                                             @AuthenticationPrincipal Jwt jwt) {
        return correspondenciaService.registrar(request, jwt.getSubject());
    }

    @GetMapping
    public Page<CorrespondenciaResponse> buscar(
            @RequestParam(required = false) String folio,
            @RequestParam(required = false) String remitente,
            @RequestParam(required = false) String asunto,
            @RequestParam(required = false) Long areaDestinoId,
            @RequestParam(required = false) EstadoCorrespondencia estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta,
            @PageableDefault(size = 20, sort = "fechaRecepcion", direction = Sort.Direction.DESC) Pageable pageable) {
        FiltrosCorrespondencia filtros = new FiltrosCorrespondencia(
                folio, remitente, asunto, areaDestinoId, estado, fechaDesde, fechaHasta);
        return correspondenciaService.buscar(filtros, pageable);
    }

    @PostMapping("/{id}/asignar")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'RECEPCIONISTA')")
    public CorrespondenciaResponse asignar(@PathVariable Long id,
                                           @Valid @RequestBody AsignarMensajeroRequest request) {
        return correspondenciaService.asignar(id, request);
    }

    @PostMapping("/{id}/entregar")
    @PreAuthorize("hasAnyRole('MENSAJERO', 'ADMIN')")
    public CorrespondenciaResponse entregar(@PathVariable Long id,
                                            @Valid @RequestBody RegistrarEntregaRequest request,
                                            @AuthenticationPrincipal Jwt jwt) {
        return correspondenciaService.registrarEntrega(id, request, jwt.getSubject());
    }

    @PostMapping("/{id}/anular")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPCIONISTA')")
    public CorrespondenciaResponse anular(@PathVariable Long id,
                                          @Valid @RequestBody AnularRequest request,
                                          @AuthenticationPrincipal Jwt jwt) {
        return correspondenciaService.anular(id, request, jwt.getSubject());
    }

    @PostMapping("/{id}/archivar")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public CorrespondenciaResponse archivar(@PathVariable Long id,
                                            @Valid @RequestBody ArchivarRequest request,
                                            @AuthenticationPrincipal Jwt jwt) {
        return correspondenciaService.archivar(id, request, jwt.getSubject());
    }

    @GetMapping("/mis-asignaciones")
    @PreAuthorize("hasAnyRole('MENSAJERO', 'ADMIN')")
    public List<CorrespondenciaResponse> misAsignaciones(@AuthenticationPrincipal Jwt jwt) {
        return correspondenciaService.misAsignacionesPendientes(jwt.getSubject());
    }
}
