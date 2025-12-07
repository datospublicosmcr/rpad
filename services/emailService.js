import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configuración del transporter SMTP
const port = parseInt(process.env.SMTP_PORT) || 465;
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.comodoro.gov.ar',
  port: port,
  secure: port === 465, // true para 465 (SSL), false para 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false // Permite certificados auto-firmados
  }
});

// Destinatarios por defecto (DGMIT)
const DEFAULT_RECIPIENTS = [
  'datospublicos@comodoro.gov.ar',
  'mit@comodoro.gov.ar',
  'investigacionterritorial@comodoro.gov.ar'
];

/**
 * Envía un email a los destinatarios por defecto (DGMIT)
 * @param {Object} options - Opciones del email
 * @param {string} options.subject - Asunto
 * @param {string} options.html - Contenido HTML
 * @param {string[]} [options.to] - Destinatarios (opcional, usa DEFAULT_RECIPIENTS)
 */
export const sendEmail = async ({ subject, html, to = DEFAULT_RECIPIENTS }) => {
  try {
    const info = await transporter.sendMail({
      from: `"RPAD - Notificaciones" <${process.env.SMTP_USER}>`,
      to: to.join(', '),
      subject,
      html
    });

    console.log(`✉️ Email enviado: ${subject} → ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error enviando email:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Envía un email a un área específica (para avisos de -40 días)
 * @param {Object} options - Opciones del email
 * @param {string} options.subject - Asunto
 * @param {string} options.html - Contenido HTML
 * @param {string[]} options.to - Destinatarios del área
 */
export const sendEmailToArea = async ({ subject, html, to }) => {
  if (!to || to.length === 0) {
    return { success: false, error: 'No hay destinatarios' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"RPAD - Datos Abiertos MCR" <${process.env.SMTP_USER}>`,
      to: to.join(', '),
      subject,
      html
    });

    console.log(`✉️ Email a área enviado: ${subject} → ${to.join(', ')} (${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error enviando email a área:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Verifica la conexión SMTP
 */
export const verifyConnection = async () => {
  try {
    console.log('🔌 Intentando conectar a SMTP...');
    console.log(`   Host: ${process.env.SMTP_HOST}`);
    console.log(`   Port: ${process.env.SMTP_PORT}`);
    console.log(`   User: ${process.env.SMTP_USER}`);
    console.log(`   Pass: ${process.env.SMTP_PASS ? '***configurado***' : '⚠️ NO CONFIGURADO'}`);
    
    await transporter.verify();
    console.log('✅ Conexión SMTP verificada');
    return { success: true };
  } catch (error) {
    console.error('❌ Error verificando SMTP:', error.message);
    console.error('   Código:', error.code);
    console.error('   Detalle:', error);
    return { success: false, error: error.message, code: error.code };
  }
};

export default transporter;
