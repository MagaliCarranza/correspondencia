package com.magali.correspondencia.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "secuencia_folio")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SecuenciaFolio {

    @Id
    @Column(name = "anio")
    private Integer anio;

    @Column(nullable = false)
    private Integer ultimoNumero;
}
