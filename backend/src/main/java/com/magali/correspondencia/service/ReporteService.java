package com.magali.correspondencia.service;

import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPageEventHelper;
import com.lowagie.text.pdf.PdfWriter;
import com.magali.correspondencia.dto.FiltrosCorrespondencia;
import com.magali.correspondencia.model.Correspondencia;
import com.magali.correspondencia.model.EstadoCorrespondencia;
import com.magali.correspondencia.model.Prioridad;
import com.magali.correspondencia.repository.AreaRepository;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReporteService {

    private static final DateTimeFormatter FORMATO_FECHA_HORA =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter FORMATO_FECHA =
            DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final ZoneId ZONA = ZoneId.systemDefault();

    private static final Font FUENTE_TITULO = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, new Color(44, 90, 160));
    private static final Font FUENTE_SUBTITULO = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, new Color(31, 41, 55));
    private static final Font FUENTE_META = FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(107, 114, 128));
    private static final Font FUENTE_ENCABEZADO_TABLA = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.WHITE);
    private static final Font FUENTE_CELDA = FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(31, 41, 55));
    private static final Font FUENTE_CELDA_ITALICA = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 7, new Color(107, 114, 128));
    private static final Color COLOR_ENCABEZADO = new Color(44, 90, 160);
    private static final Color COLOR_ZEBRA = new Color(246, 248, 252);

    private final CorrespondenciaService correspondenciaService;
    private final AreaRepository areaRepository;

    public ReporteService(CorrespondenciaService correspondenciaService, AreaRepository areaRepository) {
        this.correspondenciaService = correspondenciaService;
        this.areaRepository = areaRepository;
    }

    @Transactional(readOnly = true)
    public byte[] generarReporteCorrespondencia(FiltrosCorrespondencia filtros, String usernameOperador) {
        List<Correspondencia> registros = correspondenciaService.buscarParaReporte(filtros);

        ByteArrayOutputStream salida = new ByteArrayOutputStream();
        Document documento = new Document(PageSize.A4.rotate(), 30, 30, 40, 40);
        PdfWriter writer = PdfWriter.getInstance(documento, salida);
        writer.setPageEvent(new PieDePagina());

        documento.open();
        agregarEncabezado(documento, filtros, usernameOperador, registros.size());
        agregarResumen(documento, registros);
        agregarTabla(documento, registros);
        documento.close();

        return salida.toByteArray();
    }

    private void agregarEncabezado(Document doc, FiltrosCorrespondencia f, String usuario, int total) {
        Paragraph titulo = new Paragraph("Reporte de correspondencia", FUENTE_TITULO);
        titulo.setAlignment(Element.ALIGN_LEFT);
        titulo.setSpacingAfter(4);
        doc.add(titulo);

        String meta = "Generado por: " + usuario + "  |  Fecha: "
                + LocalDateTime.now().format(FORMATO_FECHA_HORA) + "  |  Total: " + total;
        Paragraph paramMeta = new Paragraph(meta, FUENTE_META);
        paramMeta.setSpacingAfter(6);
        doc.add(paramMeta);

        Paragraph filtros = new Paragraph("Filtros aplicados", FUENTE_SUBTITULO);
        filtros.setSpacingAfter(2);
        doc.add(filtros);

        StringBuilder detalle = new StringBuilder();
        if (esVacio(f.folio()) && esVacio(f.remitente()) && esVacio(f.asunto())
                && f.areaDestinoId() == null && f.estado() == null
                && f.fechaDesde() == null && f.fechaHasta() == null) {
            detalle.append("Sin filtros - se incluyen todos los registros.");
        } else {
            if (!esVacio(f.folio())) detalle.append("Folio: ").append(f.folio()).append("  ");
            if (!esVacio(f.remitente())) detalle.append("Remitente: ").append(f.remitente()).append("  ");
            if (!esVacio(f.asunto())) detalle.append("Asunto: ").append(f.asunto()).append("  ");
            if (f.areaDestinoId() != null) {
                String nombreArea = areaRepository.findById(f.areaDestinoId())
                        .map(a -> a.getNombre()).orElse("ID " + f.areaDestinoId());
                detalle.append("Area: ").append(nombreArea).append("  ");
            }
            if (f.estado() != null) detalle.append("Estado: ").append(f.estado()).append("  ");
            if (f.fechaDesde() != null) detalle.append("Desde: ").append(f.fechaDesde().format(FORMATO_FECHA)).append("  ");
            if (f.fechaHasta() != null) detalle.append("Hasta: ").append(f.fechaHasta().format(FORMATO_FECHA));
        }
        Paragraph detalleFiltros = new Paragraph(detalle.toString(), FUENTE_META);
        detalleFiltros.setSpacingAfter(10);
        doc.add(detalleFiltros);
    }

    private void agregarResumen(Document doc, List<Correspondencia> registros) {
        Paragraph subtitulo = new Paragraph("Resumen", FUENTE_SUBTITULO);
        subtitulo.setSpacingAfter(4);
        doc.add(subtitulo);

        Map<EstadoCorrespondencia, Long> porEstado = new EnumMap<>(EstadoCorrespondencia.class);
        for (EstadoCorrespondencia e : EstadoCorrespondencia.values()) porEstado.put(e, 0L);
        Map<Prioridad, Long> porPrioridad = new EnumMap<>(Prioridad.class);
        for (Prioridad p : Prioridad.values()) porPrioridad.put(p, 0L);

        for (Correspondencia c : registros) {
            porEstado.merge(c.getEstado(), 1L, Long::sum);
            porPrioridad.merge(c.getPrioridad(), 1L, Long::sum);
        }

        PdfPTable tabla = new PdfPTable(2);
        tabla.setWidthPercentage(50);
        tabla.setHorizontalAlignment(Element.ALIGN_LEFT);
        tabla.setSpacingAfter(10);

        agregarCelda(tabla, "Estado", true);
        agregarCelda(tabla, "Cantidad", true);
        porEstado.forEach((estado, cantidad) -> {
            agregarCelda(tabla, estado.name(), false);
            agregarCelda(tabla, String.valueOf(cantidad), false);
        });
        agregarCelda(tabla, "Prioridad", true);
        agregarCelda(tabla, "Cantidad", true);
        porPrioridad.forEach((prioridad, cantidad) -> {
            agregarCelda(tabla, prioridad.name(), false);
            agregarCelda(tabla, String.valueOf(cantidad), false);
        });
        doc.add(tabla);
    }

    private void agregarTabla(Document doc, List<Correspondencia> registros) {
        Paragraph subtitulo = new Paragraph("Detalle", FUENTE_SUBTITULO);
        subtitulo.setSpacingAfter(4);
        doc.add(subtitulo);

        PdfPTable tabla = new PdfPTable(new float[]{1.4f, 1.5f, 2.5f, 3.5f, 2.2f, 1.4f, 2.2f});
        tabla.setWidthPercentage(100);
        tabla.setHeaderRows(1);

        String[] encabezados = {"Folio", "Fecha", "Remitente", "Asunto", "Area destino", "Estado", "Mensajero"};
        for (String e : encabezados) agregarCelda(tabla, e, true);

        boolean zebra = false;
        for (Correspondencia c : registros) {
            Color fondo = zebra ? COLOR_ZEBRA : Color.WHITE;
            agregarCeldaFila(tabla, c.getFolio(), fondo);
            agregarCeldaFila(tabla,
                    LocalDateTime.ofInstant(c.getFechaRecepcion(), ZONA).format(FORMATO_FECHA_HORA), fondo);
            agregarCeldaFila(tabla, c.getRemitente(), fondo);
            agregarCeldaFila(tabla, c.getAsunto(), fondo);
            agregarCeldaFila(tabla, c.getAreaDestino().getNombre(), fondo);
            agregarCeldaFila(tabla, c.getEstado().name(), fondo);
            agregarCeldaFila(tabla,
                    c.getMensajero() == null ? "-" : c.getMensajero().getNombreCompleto(), fondo);

            String motivo = null;
            if (c.getEstado() == EstadoCorrespondencia.ANULADA && c.getMotivoAnulacion() != null) {
                motivo = "Motivo anulacion: " + c.getMotivoAnulacion();
            } else if (c.getEstado() == EstadoCorrespondencia.ARCHIVADA && c.getMotivoArchivo() != null) {
                motivo = "Motivo archivo: " + c.getMotivoArchivo();
            }
            if (motivo != null) {
                PdfPCell celdaMotivo = new PdfPCell(new Phrase(motivo, FUENTE_CELDA_ITALICA));
                celdaMotivo.setColspan(encabezados.length);
                celdaMotivo.setBackgroundColor(fondo);
                celdaMotivo.setPadding(4);
                celdaMotivo.setBorderColor(new Color(213, 219, 228));
                tabla.addCell(celdaMotivo);
            }
            zebra = !zebra;
        }
        doc.add(tabla);
    }

    private void agregarCelda(PdfPTable tabla, String texto, boolean encabezado) {
        Font fuente = encabezado ? FUENTE_ENCABEZADO_TABLA : FUENTE_CELDA;
        PdfPCell celda = new PdfPCell(new Phrase(texto, fuente));
        celda.setPadding(5);
        if (encabezado) {
            celda.setBackgroundColor(COLOR_ENCABEZADO);
        }
        celda.setBorderColor(new Color(213, 219, 228));
        tabla.addCell(celda);
    }

    private void agregarCeldaFila(PdfPTable tabla, String texto, Color fondo) {
        PdfPCell celda = new PdfPCell(new Phrase(texto, FUENTE_CELDA));
        celda.setPadding(4);
        celda.setBackgroundColor(fondo);
        celda.setBorderColor(new Color(213, 219, 228));
        tabla.addCell(celda);
    }

    private boolean esVacio(String s) {
        return s == null || s.isBlank();
    }

    private static class PieDePagina extends PdfPageEventHelper {
        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            Rectangle pagina = document.getPageSize();
            Phrase pie = new Phrase("Pagina " + writer.getPageNumber(), FUENTE_META);
            com.lowagie.text.pdf.ColumnText.showTextAligned(
                    writer.getDirectContent(),
                    Element.ALIGN_CENTER,
                    pie,
                    (pagina.getLeft() + pagina.getRight()) / 2,
                    pagina.getBottom() + 20,
                    0);
            Chunk.NEWLINE.toString();
        }
    }
}
