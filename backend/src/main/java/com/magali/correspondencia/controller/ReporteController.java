package com.magali.correspondencia.controller;

import com.magali.correspondencia.dto.FiltrosCorrespondencia;
import com.magali.correspondencia.model.EstadoCorrespondencia;
import com.magali.correspondencia.service.ReporteService;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reportes")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
public class ReporteController {

    private static final DateTimeFormatter FORMATO_ARCHIVO = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    private final ReporteService reporteService;

    public ReporteController(ReporteService reporteService) {
        this.reporteService = reporteService;
    }

    @GetMapping(value = "/correspondencia.pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> descargarCorrespondenciaPdf(
            @RequestParam(required = false) String folio,
            @RequestParam(required = false) String remitente,
            @RequestParam(required = false) String asunto,
            @RequestParam(required = false) Long areaDestinoId,
            @RequestParam(required = false) EstadoCorrespondencia estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta,
            @AuthenticationPrincipal Jwt jwt) {
        FiltrosCorrespondencia filtros = new FiltrosCorrespondencia(
                folio, remitente, asunto, areaDestinoId, estado, fechaDesde, fechaHasta);
        byte[] pdf = reporteService.generarReporteCorrespondencia(filtros, jwt.getSubject());

        String nombreArchivo = "correspondencia_" + java.time.LocalDateTime.now().format(FORMATO_ARCHIVO) + ".pdf";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", nombreArchivo);
        headers.setContentLength(pdf.length);
        return new ResponseEntity<>(pdf, headers, org.springframework.http.HttpStatus.OK);
    }
}
