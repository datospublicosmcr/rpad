/**
 * Controlador para generación de notas administrativas DOCX
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType
} from 'docx';
import pool from '../config/database.js';

/**
 * Formatear fecha en español
 */
function formatearFecha(fechaStr) {
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const fecha = new Date(fechaStr + 'T12:00:00');
  const dia = fecha.getDate();
  const mes = meses[fecha.getMonth()];
  const anio = fecha.getFullYear();
  return `${dia} de ${mes} de ${anio}`;
}

/**
 * Generar nota DOCX
 */
export async function generarNota(req, res) {
  try {
    const { fecha, numero, area_id, tipo, datasets } = req.body;

    // Validaciones
    if (!fecha || !numero || !area_id || !tipo || !datasets || datasets.length === 0) {
      return res.status(400).json({ success: false, error: 'Datos incompletos' });
    }

    // Obtener datos del área
    const [areas] = await pool.query('SELECT * FROM areas WHERE id = ?', [area_id]);
    if (areas.length === 0) {
      return res.status(404).json({ success: false, error: 'Área no encontrada' });
    }
    const area = areas[0];

    // Obtener datasets con frecuencias
    const datasetIds = datasets.map(d => d.id);
    const [datasetsDb] = await pool.query(`
      SELECT d.*, f.nombre as frecuencia_nombre 
      FROM datasets d 
      LEFT JOIN frecuencias f ON d.frecuencia_id = f.id 
      WHERE d.id IN (?)
    `, [datasetIds]);

    // Mapear períodos a datasets
    const datasetsConPeriodos = datasetsDb.map(ds => {
      const config = datasets.find(d => d.id === ds.id);
      return {
        ...ds,
        periodo_inicial: config?.periodo_inicial,
        periodo_final: config?.periodo_final
      };
    });

    // Generar documento según tipo
    let doc;
    if (tipo === 'interna') {
      doc = generarNotaInterna(fecha, numero, area, datasetsConPeriodos);
    } else {
      doc = generarNotaExterna(fecha, numero, area, datasetsConPeriodos);
    }

    // Convertir a buffer
    const buffer = await Packer.toBuffer(doc);

    // Enviar respuesta
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=nota-${tipo}-${numero.replace('/', '-')}.docx`);
    res.send(buffer);

  } catch (error) {
    console.error('Error generando nota:', error);
    res.status(500).json({ success: false, error: 'Error al generar la nota' });
  }
}

/**
 * Generar nota interna
 */
function generarNotaInterna(fecha, numero, area, datasets) {
  const fechaFormateada = formatearFecha(fecha);
  
  // Construir lista de datasets
  const listaDatasets = datasets.map(ds => {
    let texto = `${ds.titulo}`;
    if (ds.frecuencia_nombre) {
      texto += ` (frecuencia de actualización: ${ds.frecuencia_nombre})`;
    }
    if (ds.periodo_inicial || ds.periodo_final) {
      const desde = ds.periodo_inicial ? formatearFechaCorta(ds.periodo_inicial) : '...';
      const hasta = ds.periodo_final ? formatearFechaCorta(ds.periodo_final) : '...';
      texto += ` - Período: ${desde} al ${hasta}`;
    }
    return texto;
  });

  const children = [

    // REF
    new Paragraph({
      children: [
        new TextRun({ text: 'REF.: ', bold: true, font: 'Arial', size: 24 }),
        new TextRun({ text: '"Solicitud de datos para Portal de Datos Abiertos Municipal"', font: 'Arial', size: 24 })
      ],
      alignment: AlignmentType.RIGHT,
      spacing: { after: 100 }
    }),

    // Número de nota
    new Paragraph({
      children: [
        new TextRun({ text: 'Nota N° ', bold: true, font: 'Arial', size: 24 }),
        new TextRun({ text: numero, font: 'Arial', size: 24 })
      ],
      alignment: AlignmentType.RIGHT,
      spacing: { after: 400 }
    }),

    // Destinatario
    new Paragraph({
      children: [
        new TextRun({ 
          text: 'SUBSECRETARÍA DE MODERNIZACIÓN Y TRANSPARENCIA', 
          bold: true, 
          underline: {},
          font: 'Arial', 
          size: 24 
        })
      ],
      spacing: { after: 400 }
    }),

    // Primer párrafo
    new Paragraph({
      children: [
        new TextRun({ 
          text: `Solicito a Ud. tenga a bien gestionar ante la `, 
          font: 'Arial', 
          size: 24 
        }),
        new TextRun({ 
          text: area.nombre, 
          bold: true,
          font: 'Arial', 
          size: 24 
        }),
        new TextRun({ 
          text: area.area_superior ? `, dependiente de la ${area.area_superior}, ` : ', ',
          font: 'Arial', 
          size: 24 
        }),
        new TextRun({ 
          text: 'la remisión de la siguiente información, preferiblemente en formato digital editable (Excel, CSV, etc.):',
          font: 'Arial', 
          size: 24 
        })
      ],
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 200 }
    })
  ];

  // Lista de datasets
  listaDatasets.forEach(item => {
    children.push(new Paragraph({
      children: [
        new TextRun({ text: '• ', font: 'Arial', size: 24 }),
        new TextRun({ text: item, font: 'Arial', size: 24 })
      ],
      indent: { left: 720 },
      spacing: { after: 100 }
    }));
  });

  // Justificación
  children.push(new Paragraph({
    children: [
      new TextRun({ text: 'Justificación:', bold: true, font: 'Arial', size: 24 })
    ],
    spacing: { before: 300, after: 200 }
  }));

  children.push(new Paragraph({
    children: [
      new TextRun({ 
        text: 'Dicha solicitud se enmarca en el cumplimiento de la Ordenanza N° 17.662/23, que establece la necesidad de garantizar que los datos publicados en el portal de datos abiertos mantengan su valor. Motivo por el cual resulta fundamental mantener actualizada la información disponible en el mencionado sitio.',
        font: 'Arial', 
        size: 24 
      })
    ],
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 200 }
  }));

  children.push(new Paragraph({
    children: [
      new TextRun({ 
        text: 'Los datos solicitados pueden ser remitidos a los correos electrónicos ',
        font: 'Arial', 
        size: 24 
      }),
      new TextRun({ 
        text: 'datospublicos@comodoro.gov.ar',
        font: 'Arial', 
        size: 24,
        underline: {}
      }),
      new TextRun({ 
        text: ' o ',
        font: 'Arial', 
        size: 24 
      }),
      new TextRun({ 
        text: 'mit@comodoro.gov.ar',
        font: 'Arial', 
        size: 24,
        underline: {}
      }),
      new TextRun({ 
        text: ', o vía WhatsApp al ',
        font: 'Arial', 
        size: 24 
      }),
      new TextRun({ 
        text: '+54 9 2974 05-6894',
        font: 'Arial', 
        size: 24 
      }),
      new TextRun({ 
        text: '. Los mismos, una vez recibidos, serán publicados en el Portal de Datos Abiertos Municipal en cumplimiento del Artículo 9° de la mencionada ordenanza, garantizando su disponibilidad en formatos abiertos y reutilizables para generar valor económico y social.',
        font: 'Arial', 
        size: 24 
      })
    ],
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 400 }
  }));

  // Firma
  children.push(new Paragraph({
    children: [
      new TextRun({ 
        text: 'DIRECCIÓN GENERAL DE MODERNIZACIÓN E INVESTIGACIÓN TERRITORIAL', 
        bold: true, 
        underline: {},
        font: 'Arial', 
        size: 24 
      }),
      new TextRun({ 
        text: `, ${fechaFormateada}.`,
        font: 'Arial', 
        size: 24 
      })
    ],
    spacing: { before: 200 }
  }));

  return new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Arial', size: 24 }
        }
      }
    },
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      children
    }]
  });
}

/**
 * Generar nota externa
 */
function generarNotaExterna(fecha, numero, area, datasets) {
  const fechaFormateada = formatearFecha(fecha);
  
  // Construir lista de datasets
  const listaDatasets = datasets.map(ds => {
    let texto = `${ds.titulo}`;
    if (ds.frecuencia_nombre) {
      texto += ` (frecuencia de actualización: ${ds.frecuencia_nombre})`;
    }
    if (ds.periodo_inicial || ds.periodo_final) {
      const desde = ds.periodo_inicial ? formatearFechaCorta(ds.periodo_inicial) : '...';
      const hasta = ds.periodo_final ? formatearFechaCorta(ds.periodo_final) : '...';
      texto += ` - Período: ${desde} al ${hasta}`;
    }
    return texto;
  });

  const children = [
    // Fecha alineada a la derecha
    new Paragraph({
      children: [
        new TextRun({ text: `Comodoro Rivadavia, ${fechaFormateada}`, font: 'Arial', size: 24 })
      ],
      alignment: AlignmentType.RIGHT,
      spacing: { after: 400 }
    }),

    // Destinatario
    new Paragraph({
      children: [
        new TextRun({ text: 'A la', font: 'Arial', size: 24 })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ 
          text: area.nombre, 
          bold: true, 
          underline: {},
          font: 'Arial', 
          size: 24 
        })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ 
          text: 'PRESENTE', 
          bold: true, 
          underline: {},
          font: 'Arial', 
          size: 24 
        })
      ],
      spacing: { after: 400 }
    }),

    // REF
    new Paragraph({
      children: [
        new TextRun({ text: 'REF.: ', bold: true, font: 'Arial', size: 24 }),
        new TextRun({ text: '"Solicitud de datos para Portal de Datos Abiertos Municipal"', font: 'Arial', size: 24 })
      ],
      alignment: AlignmentType.RIGHT,
      spacing: { after: 100 }
    }),

    // Número de nota
    new Paragraph({
      children: [
        new TextRun({ text: 'Nota N° ', bold: true, font: 'Arial', size: 24 }),
        new TextRun({ text: numero, font: 'Arial', size: 24 })
      ],
      alignment: AlignmentType.RIGHT,
      spacing: { after: 400 }
    }),

    // Saludo
    new Paragraph({
      children: [
        new TextRun({ text: 'De nuestra consideración:', font: 'Arial', size: 24 })
      ],
      spacing: { after: 300 }
    }),

    // Primer párrafo
    new Paragraph({
      children: [
        new TextRun({ 
          text: 'Nos dirigimos a Uds. a fin de solicitarles tengan a bien brindar la siguiente información, preferiblemente en formato digital editable (Excel, CSV, etc.):',
          font: 'Arial', 
          size: 24 
        })
      ],
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 200 }
    })
  ];

  // Lista de datasets
  listaDatasets.forEach(item => {
    children.push(new Paragraph({
      children: [
        new TextRun({ text: '• ', font: 'Arial', size: 24 }),
        new TextRun({ text: item, font: 'Arial', size: 24 })
      ],
      indent: { left: 720 },
      spacing: { after: 100 }
    }));
  });

  // Justificación
  children.push(new Paragraph({
    children: [
      new TextRun({ 
        text: 'Motiva dicha solicitud la necesidad de actualizar y publicar los datasets disponibles en la página oficial de Datos Abiertos de la Municipalidad de Comodoro Rivadavia (',
        font: 'Arial', 
        size: 24 
      }),
      new TextRun({ 
        text: 'datos.comodoro.gov.ar',
        font: 'Arial', 
        size: 24,
        underline: {}
      }),
      new TextRun({ 
        text: '), en cumplimiento de la Ordenanza N° 17.662/23 y los principios de transparencia y acceso a la información pública que sustentan nuestras políticas de gobierno abierto.',
        font: 'Arial', 
        size: 24 
      })
    ],
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 300, after: 200 }
  }));

  children.push(new Paragraph({
    children: [
      new TextRun({ 
        text: 'Los datos pueden ser remitidos a los correos electrónicos ',
        font: 'Arial', 
        size: 24 
      }),
      new TextRun({ 
        text: 'datospublicos@comodoro.gov.ar',
        font: 'Arial', 
        size: 24,
        underline: {}
      }),
      new TextRun({ 
        text: ' o ',
        font: 'Arial', 
        size: 24 
      }),
      new TextRun({ 
        text: 'mit@comodoro.gov.ar',
        font: 'Arial', 
        size: 24,
        underline: {}
      }),
      new TextRun({ 
        text: ', o vía WhatsApp al ',
        font: 'Arial', 
        size: 24 
      }),
      new TextRun({ 
        text: '+54 9 2974 05-6894',
        font: 'Arial', 
        size: 24 
      }),
      new TextRun({ 
        text: '.',
        font: 'Arial', 
        size: 24 
      })
    ],
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 200 }
  }));

  children.push(new Paragraph({
    children: [
      new TextRun({ 
        text: 'Quedamos a disposición para coordinar los detalles técnicos o administrativos necesarios.',
        font: 'Arial', 
        size: 24 
      })
    ],
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 300 }
  }));

  // Despedida
  children.push(new Paragraph({
    children: [
      new TextRun({ text: 'Sin más, saludamos a Uds. atentamente.', font: 'Arial', size: 24 })
    ],
    spacing: { after: 600 }
  }));

  return new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Arial', size: 24 }
        }
      }
    },
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      children
    }]
  });
}

/**
 * Formatear fecha corta
 */
function formatearFechaCorta(fechaStr) {
  if (!fechaStr) return '';
  const fecha = new Date(fechaStr + 'T12:00:00');
  return fecha.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}
