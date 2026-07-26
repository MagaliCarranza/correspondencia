package com.magali.correspondencia.service;

import com.magali.correspondencia.dto.AnularRequest;
import com.magali.correspondencia.dto.ArchivarRequest;
import com.magali.correspondencia.dto.AsignarMensajeroRequest;
import com.magali.correspondencia.dto.CorrespondenciaResponse;
import com.magali.correspondencia.dto.CrearCorrespondenciaRequest;
import com.magali.correspondencia.dto.FiltrosCorrespondencia;
import com.magali.correspondencia.dto.RegistrarEntregaRequest;
import com.magali.correspondencia.exception.RecursoNoEncontradoException;
import com.magali.correspondencia.exception.ReglaNegocioException;
import com.magali.correspondencia.model.Area;
import com.magali.correspondencia.model.Correspondencia;
import com.magali.correspondencia.model.EstadoCorrespondencia;
import com.magali.correspondencia.model.Rol;
import com.magali.correspondencia.model.SecuenciaFolio;
import com.magali.correspondencia.model.Usuario;
import com.magali.correspondencia.repository.AreaRepository;
import com.magali.correspondencia.repository.CorrespondenciaRepository;
import com.magali.correspondencia.repository.SecuenciaFolioRepository;
import com.magali.correspondencia.repository.UsuarioRepository;
import jakarta.persistence.criteria.Predicate;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CorrespondenciaService {

    private final CorrespondenciaRepository correspondenciaRepository;
    private final SecuenciaFolioRepository secuenciaRepository;
    private final AreaRepository areaRepository;
    private final UsuarioRepository usuarioRepository;

    public CorrespondenciaService(CorrespondenciaRepository correspondenciaRepository,
                                  SecuenciaFolioRepository secuenciaRepository,
                                  AreaRepository areaRepository,
                                  UsuarioRepository usuarioRepository) {
        this.correspondenciaRepository = correspondenciaRepository;
        this.secuenciaRepository = secuenciaRepository;
        this.areaRepository = areaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public CorrespondenciaResponse registrar(CrearCorrespondenciaRequest request, String usernameRecepcionista) {
        Area areaDestino = areaRepository.findById(request.areaDestinoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Area de destino no encontrada"));

        Usuario recepcionista = usuarioRepository.findByUsername(usernameRecepcionista)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario recepcionista no encontrado"));

        Instant ahora = Instant.now();
        String folio = generarFolio(ahora);

        Correspondencia correspondencia = Correspondencia.builder()
                .folio(folio)
                .fechaRecepcion(ahora)
                .remitente(request.remitente().trim())
                .tipoRemitente(request.tipoRemitente())
                .asunto(request.asunto().trim())
                .tipo(request.tipo())
                .prioridad(request.prioridad())
                .areaDestino(areaDestino)
                .observaciones(request.observaciones() == null ? null : request.observaciones().trim())
                .recepcionadoPor(recepcionista)
                .build();

        return mapear(correspondenciaRepository.save(correspondencia));
    }

    @Transactional(readOnly = true)
    public Page<CorrespondenciaResponse> buscar(FiltrosCorrespondencia filtros, Pageable pageable) {
        return correspondenciaRepository.findAll(construirSpec(filtros), pageable).map(this::mapear);
    }

    @Transactional(readOnly = true)
    public List<Correspondencia> buscarParaReporte(FiltrosCorrespondencia filtros) {
        return correspondenciaRepository.findAll(construirSpec(filtros),
                Sort.by(Sort.Direction.DESC, "fechaRecepcion"));
    }

    @Transactional
    public CorrespondenciaResponse asignar(Long correspondenciaId, AsignarMensajeroRequest request) {
        Correspondencia correspondencia = correspondenciaRepository.findById(correspondenciaId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Correspondencia no encontrada"));

        if (correspondencia.getEstado() == EstadoCorrespondencia.ENTREGADA
                || correspondencia.getEstado() == EstadoCorrespondencia.ARCHIVADA
                || correspondencia.getEstado() == EstadoCorrespondencia.ANULADA) {
            throw new ReglaNegocioException(
                    "No se puede asignar una correspondencia en estado " + correspondencia.getEstado());
        }

        Usuario mensajero = usuarioRepository.findById(request.mensajeroId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Mensajero no encontrado"));

        if (mensajero.getRol() != Rol.MENSAJERO) {
            throw new ReglaNegocioException("El usuario seleccionado no es mensajero");
        }
        if (mensajero.isBloqueada()) {
            throw new ReglaNegocioException("El mensajero seleccionado esta bloqueado");
        }

        correspondencia.setMensajero(mensajero);
        correspondencia.setFechaAsignacion(Instant.now());
        correspondencia.setEstado(EstadoCorrespondencia.EN_TRAMITE);

        return mapear(correspondenciaRepository.save(correspondencia));
    }

    @Transactional
    public CorrespondenciaResponse registrarEntrega(Long correspondenciaId,
                                                    RegistrarEntregaRequest request,
                                                    String usernameMensajero) {
        Correspondencia correspondencia = correspondenciaRepository.findById(correspondenciaId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Correspondencia no encontrada"));

        if (correspondencia.getEstado() != EstadoCorrespondencia.EN_TRAMITE) {
            throw new ReglaNegocioException(
                    "Solo se puede entregar una correspondencia en estado EN_TRAMITE");
        }

        Usuario mensajeroJwt = usuarioRepository.findByUsername(usernameMensajero)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        boolean esAdmin = mensajeroJwt.getRol() == Rol.ADMIN;
        boolean esElAsignado = correspondencia.getMensajero() != null
                && correspondencia.getMensajero().getId().equals(mensajeroJwt.getId());

        if (!esAdmin && !esElAsignado) {
            throw new ReglaNegocioException("Solo el mensajero asignado puede registrar la entrega");
        }

        correspondencia.setNombreRecibe(request.nombreRecibe().trim());
        correspondencia.setObservacionesEntrega(
                request.observacionesEntrega() == null ? null : request.observacionesEntrega().trim());
        correspondencia.setFechaEntrega(Instant.now());
        correspondencia.setEstado(EstadoCorrespondencia.ENTREGADA);

        return mapear(correspondenciaRepository.save(correspondencia));
    }

    @Transactional
    public CorrespondenciaResponse anular(Long correspondenciaId, AnularRequest request, String usernameOperador) {
        Correspondencia correspondencia = correspondenciaRepository.findById(correspondenciaId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Correspondencia no encontrada"));

        if (correspondencia.getEstado() != EstadoCorrespondencia.RECIBIDA) {
            throw new ReglaNegocioException(
                    "Solo se puede anular una correspondencia en estado RECIBIDA");
        }

        Usuario operador = usuarioRepository.findByUsername(usernameOperador)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        correspondencia.setMotivoAnulacion(request.motivo().trim());
        correspondencia.setAnuladoEn(Instant.now());
        correspondencia.setAnuladoPor(operador);
        correspondencia.setEstado(EstadoCorrespondencia.ANULADA);

        return mapear(correspondenciaRepository.save(correspondencia));
    }

    @Transactional
    public CorrespondenciaResponse archivar(Long correspondenciaId, ArchivarRequest request, String usernameOperador) {
        Correspondencia correspondencia = correspondenciaRepository.findById(correspondenciaId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Correspondencia no encontrada"));

        if (correspondencia.getEstado() != EstadoCorrespondencia.ENTREGADA) {
            throw new ReglaNegocioException(
                    "Solo se puede archivar una correspondencia en estado ENTREGADA");
        }

        Usuario operador = usuarioRepository.findByUsername(usernameOperador)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        String motivo = request.motivo();
        correspondencia.setMotivoArchivo(motivo == null || motivo.isBlank() ? null : motivo.trim());
        correspondencia.setArchivadoEn(Instant.now());
        correspondencia.setArchivadoPor(operador);
        correspondencia.setEstado(EstadoCorrespondencia.ARCHIVADA);

        return mapear(correspondenciaRepository.save(correspondencia));
    }

    @Transactional(readOnly = true)
    public List<CorrespondenciaResponse> misAsignacionesPendientes(String usernameMensajero) {
        Usuario mensajero = usuarioRepository.findByUsername(usernameMensajero)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        Specification<Correspondencia> spec = (root, query, cb) -> cb.and(
                cb.equal(root.get("mensajero").get("id"), mensajero.getId()),
                cb.equal(root.get("estado"), EstadoCorrespondencia.EN_TRAMITE)
        );

        return correspondenciaRepository.findAll(spec).stream()
                .sorted((a, b) -> b.getFechaAsignacion().compareTo(a.getFechaAsignacion()))
                .map(this::mapear)
                .toList();
    }

    private String generarFolio(Instant ahora) {
        int anio = ahora.atZone(ZoneOffset.UTC).getYear();
        SecuenciaFolio secuencia = secuenciaRepository.buscarConBloqueo(anio)
                .orElseGet(() -> secuenciaRepository.save(new SecuenciaFolio(anio, 0)));
        int siguiente = secuencia.getUltimoNumero() + 1;
        secuencia.setUltimoNumero(siguiente);
        secuenciaRepository.save(secuencia);
        return String.format("CORR-%d-%04d", anio, siguiente);
    }

    private Specification<Correspondencia> construirSpec(FiltrosCorrespondencia f) {
        return (root, query, cb) -> {
            List<Predicate> preds = new ArrayList<>();
            if (f.folio() != null && !f.folio().isBlank()) {
                preds.add(cb.like(cb.upper(root.get("folio")), "%" + f.folio().toUpperCase() + "%"));
            }
            if (f.remitente() != null && !f.remitente().isBlank()) {
                preds.add(cb.like(cb.upper(root.get("remitente")), "%" + f.remitente().toUpperCase() + "%"));
            }
            if (f.asunto() != null && !f.asunto().isBlank()) {
                preds.add(cb.like(cb.upper(root.get("asunto")), "%" + f.asunto().toUpperCase() + "%"));
            }
            if (f.areaDestinoId() != null) {
                preds.add(cb.equal(root.get("areaDestino").get("id"), f.areaDestinoId()));
            }
            if (f.estado() != null) {
                preds.add(cb.equal(root.get("estado"), f.estado()));
            }
            if (f.fechaDesde() != null) {
                Instant desde = LocalDate.from(f.fechaDesde()).atStartOfDay().toInstant(ZoneOffset.UTC);
                preds.add(cb.greaterThanOrEqualTo(root.get("fechaRecepcion"), desde));
            }
            if (f.fechaHasta() != null) {
                Instant hasta = LocalDateTime.of(f.fechaHasta(), java.time.LocalTime.MAX).toInstant(ZoneOffset.UTC);
                preds.add(cb.lessThanOrEqualTo(root.get("fechaRecepcion"), hasta));
            }
            return cb.and(preds.toArray(new Predicate[0]));
        };
    }

    private CorrespondenciaResponse mapear(Correspondencia c) {
        return new CorrespondenciaResponse(
                c.getId(),
                c.getFolio(),
                c.getFechaRecepcion(),
                c.getRemitente(),
                c.getTipoRemitente().name(),
                c.getAsunto(),
                c.getTipo().name(),
                c.getPrioridad().name(),
                c.getAreaDestino().getId(),
                c.getAreaDestino().getNombre(),
                c.getObservaciones(),
                c.getEstado().name(),
                c.getRecepcionadoPor().getNombreCompleto(),
                c.getMensajero() == null ? null : c.getMensajero().getId(),
                c.getMensajero() == null ? null : c.getMensajero().getNombreCompleto(),
                c.getFechaAsignacion(),
                c.getFechaEntrega(),
                c.getNombreRecibe(),
                c.getObservacionesEntrega(),
                c.getMotivoAnulacion(),
                c.getAnuladoEn(),
                c.getAnuladoPor() == null ? null : c.getAnuladoPor().getNombreCompleto(),
                c.getMotivoArchivo(),
                c.getArchivadoEn(),
                c.getArchivadoPor() == null ? null : c.getArchivadoPor().getNombreCompleto(),
                c.getCreadoEn()
        );
    }
}
