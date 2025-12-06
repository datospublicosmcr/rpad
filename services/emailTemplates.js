/**
 * Plantillas de email para notificaciones RPAD
 * Colores institucionales basados en styles.css
 */

const COLORS = {
  primary: '#0066cc',
  success: '#28a745',
  warning: '#ffc107',
  danger: '#dc3545',
  orange: '#fd7e14',
  dark: '#1a1a2e',
  muted: '#6c757d',
  light: '#f8f9fa',
  border: '#e9ecef'
};

const RPAD_URL = 'https://rpad.mcrmodernizacion.gob.ar';

/**
 * Genera el HTML base del email
 */
const baseTemplate = ({ title, subtitle, actionText, datasets, accentColor }) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: ${COLORS.light};">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${COLORS.dark} 0%, ${COLORS.primary} 100%); padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">📊 RPAD</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0; font-size: 14px;">Sistema de Notificaciones</p>
            </td>
          </tr>

          <!-- Accent Bar -->
          <tr>
            <td style="background-color: ${accentColor}; height: 4px;"></td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding: 24px 24px 16px 24px;">
              <h2 style="color: ${COLORS.dark}; margin: 0; font-size: 20px; font-weight: 600;">${title}</h2>
              <p style="color: ${COLORS.muted}; margin: 8px 0 0 0; font-size: 14px;">${subtitle}</p>
            </td>
          </tr>

          <!-- Action Box -->
          <tr>
            <td style="padding: 0 24px;">
              <table role="presentation" style="width: 100%; background-color: ${COLORS.light}; border-radius: 6px; border-left: 4px solid ${accentColor};">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0; color: ${COLORS.dark}; font-size: 14px;"><strong>Acción recomendada:</strong></p>
                    <p style="margin: 8px 0 0 0; color: ${COLORS.muted}; font-size: 14px;">${actionText}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 24px;">
              <hr style="border: none; border-top: 1px solid ${COLORS.border}; margin: 0;">
            </td>
          </tr>

          <!-- Datasets List -->
          <tr>
            <td style="padding: 0 24px;">
              <p style="margin: 0 0 16px 0; color: ${COLORS.dark}; font-size: 14px; font-weight: 600;">Datasets implicados:</p>
              ${datasets.map((d, i) => `
                <table role="presentation" style="width: 100%; margin-bottom: 12px; background-color: #ffffff; border: 1px solid ${COLORS.border}; border-radius: 6px;">
                  <tr>
                    <td style="padding: 12px;">
                      <p style="margin: 0; color: ${COLORS.dark}; font-size: 14px; font-weight: 600;">${i + 1}. ${escapeHtml(d.titulo)}</p>
                      <p style="margin: 6px 0 0 0; color: ${COLORS.muted}; font-size: 13px;">🏢 ${escapeHtml(d.area_responsable)}</p>
                      ${d.url_dataset ? `<p style="margin: 6px 0 0 0;"><a href="${d.url_dataset}" style="color: ${COLORS.primary}; font-size: 13px; text-decoration: none;">🔗 Ver en Portal de Datos Abiertos</a></p>` : ''}
                    </td>
                  </tr>
                </table>
              `).join('')}
            </td>
          </tr>

          <!-- RPAD Link -->
          <tr>
            <td style="padding: 24px; text-align: center;">
              <a href="${RPAD_URL}" style="display: inline-block; background-color: ${COLORS.primary}; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500;">Ver todos los datasets en RPAD</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: ${COLORS.light}; padding: 16px 24px; text-align: center; border-top: 1px solid ${COLORS.border};">
              <p style="margin: 0; color: ${COLORS.muted}; font-size: 12px;">
                Sistema de Notificaciones RPAD<br>
                Dirección de Datos Públicos y Comunicación<br>
                Municipalidad de Comodoro Rivadavia
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Escapa caracteres HTML
 */
const escapeHtml = (text) => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

// =====================================================
// PLANTILLAS PARA INTERNOS
// =====================================================

export const interno60dias = (datasets) => ({
  subject: 'Planificación: Datasets Internos (60 días)',
  html: baseTemplate({
    title: 'Hola, equipo',
    subtitle: 'Es momento de iniciar la planificación',
    actionText: 'Los siguientes datasets gestionados por nuestra dirección vencen en dos meses. Recomendamos revisar las fuentes de datos y verificar disponibilidad técnica.',
    datasets,
    accentColor: COLORS.primary
  })
});

export const interno30dias = (datasets) => ({
  subject: 'Atención: Vencimiento en 1 mes (Internos)',
  html: baseTemplate({
    title: 'Aviso de actualización',
    subtitle: 'Restan 30 días para la fecha límite',
    actionText: 'Los siguientes datasets gestionados por nuestra dirección requieren atención. Por favor, prioricen su procesamiento para evitar atrasos.',
    datasets,
    accentColor: COLORS.warning
  })
});

export const internoVencido = (datasets) => ({
  subject: 'Resumen Mensual: Datasets Atrasados (Internos)',
  html: baseTemplate({
    title: 'Reporte de estado: Atrasado',
    subtitle: 'Hoy es día 1º del mes',
    actionText: 'Los siguientes datasets gestionados por nuestra dirección figuran como vencidos en el sistema. Es necesario regularizar su situación a la brevedad para mantener el cumplimiento de la Ordenanza N° 17.662/23.',
    datasets,
    accentColor: COLORS.danger
  })
});

// =====================================================
// PLANTILLAS PARA EXTERNOS
// =====================================================

export const externo60dias = (datasets) => ({
  subject: 'Gestión Administrativa: Redacción de Notas',
  html: baseTemplate({
    title: 'Inicio del proceso administrativo',
    subtitle: 'Faltan 60 días para el vencimiento',
    actionText: 'Redactar las notas de solicitud formal dirigidas a las áreas responsables listadas abajo.',
    datasets,
    accentColor: COLORS.primary
  })
});

export const externo40dias = (datasets) => ({
  subject: 'Logística: Distribución de Notas',
  html: baseTemplate({
    title: 'Fase de distribución',
    subtitle: 'Faltan 40 días para el vencimiento. La etapa de redacción debería estar finalizada',
    actionText: 'Gestionar la logística y entrega de los pedidos a las áreas correspondientes para asegurar la recepción de datos a tiempo.',
    datasets,
    accentColor: COLORS.warning
  })
});

export const externo5dias = (datasets) => ({
  subject: 'Seguimiento: Vencimiento Inminente',
  html: baseTemplate({
    title: 'Alerta de plazo',
    subtitle: 'Quedan solo 5 días',
    actionText: 'Si no se ha recibido respuesta, recomendamos contactar telefónicamente o vía email al enlace del área responsable para agilizar el envío.',
    datasets,
    accentColor: COLORS.orange
  })
});

export const externoVencido = (datasets) => ({
  subject: 'Resumen Mensual: Sin Respuesta (Externos)',
  html: baseTemplate({
    title: 'Reporte de estado: Sin Respuesta',
    subtitle: 'Hoy es día 1º del mes',
    actionText: 'Aún aguardamos datos de las siguientes áreas externas. Se recomienda iniciar las acciones de reclamo o reiteración de solicitud.',
    datasets,
    accentColor: COLORS.danger
  })
});
