package com.magali.correspondencia.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "correspondencia", indexes = {
        @Index(name = "idx_correspondencia_folio", columnList = "folio", unique = true),
        @Index(name = "idx_correspondencia_estado", columnList = "estado"),
        @Index(name = "idx_correspondencia_fecha", columnList = "fechaRecepcion")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Correspondencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String folio;

    @Column(nullable = false)
    private Instant fechaRecepcion;

    @Column(nullable = false, length = 120)
    private String remitente;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TipoRemitente tipoRemitente;

    @Column(nullable = false, length = 200)
    private String asunto;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private TipoCorrespondencia tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Prioridad prioridad;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "area_destino_id", nullable = false)
    private Area areaDestino;

    @Column(length = 500)
    private String observaciones;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    @Default
    private EstadoCorrespondencia estado = EstadoCorrespondencia.RECIBIDA;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recepcionado_por_id", nullable = false)
    private Usuario recepcionadoPor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mensajero_id")
    private Usuario mensajero;

    private Instant fechaAsignacion;

    private Instant fechaEntrega;

    @Column(length = 120)
    private String nombreRecibe;

    @Column(length = 500)
    private String observacionesEntrega;

    @Column(length = 500)
    private String motivoAnulacion;

    private Instant anuladoEn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "anulado_por_id")
    private Usuario anuladoPor;

    @Column(length = 500)
    private String motivoArchivo;

    private Instant archivadoEn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "archivado_por_id")
    private Usuario archivadoPor;

    @Column(nullable = false)
    @Default
    private Instant creadoEn = Instant.now();
}
