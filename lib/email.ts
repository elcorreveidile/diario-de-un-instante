import { Resend } from 'resend';

// Email del remitente (debe estar verificado en Resend)
const FROM_EMAIL = 'Diario de un Instante <newsletter@diariodeuninstante.com>';
const BASE_URL = 'https://www.diariodeuninstante.com';

// Inicializar Resend de forma lazy
function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY no está configurada');
  }
  return new Resend(process.env.RESEND_API_KEY);
}

/**
 * Enviar email de confirmación de suscripción
 */
export async function sendConfirmationEmail(email: string, token: string) {
  try {
    const confirmUrl = `${BASE_URL}/newsletter/confirm?token=${token}`;

    await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Confirma tu suscripción a Diario de un Instante',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirma tu suscripción</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { font-size: 24px; font-weight: bold; color: #7c3aed; }
              .content { background: #f9fafb; border-radius: 8px; padding: 30px; margin-bottom: 20px; }
              .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; }
              .button:hover { background: #6d28d9; }
              .footer { text-align: center; font-size: 12px; color: #6b7280; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">🌸 Diario de un Instante</div>
              </div>

              <div class="content">
                <h1>¡Gracias por suscribirte! 🎉</h1>
                <p>Estás a un paso de recibir los mejores instantes directamente en tu email.</p>
                <p>Por favor, confirma tu suscripción haciendo clic en el siguiente botón:</p>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${confirmUrl}" class="button">Confirmar suscripción</a>
                </div>

                <p style="font-size: 14px; color: #666;">
                  O copia y pega este enlace en tu navegador:<br>
                  <a href="${confirmUrl}" style="color: #7c3aed;">${confirmUrl}</a>
                </p>

                <p style="font-size: 12px; color: #999; margin-top: 20px;">
                  Este enlace expirará en 7 días. Si no solicitaste esta suscripción, puedes ignorar este email.
                </p>
              </div>

              <div class="footer">
                <p>Diario de un Instante - Un jardín digital para cultivar una vida más consciente</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log(`[Email] Confirmación enviada a ${email}`);
  } catch (error) {
    console.error('[Email] Error enviando confirmación:', error);
    throw error;
  }
}

/**
 * Enviar email de bienvenida
 */
export async function sendWelcomeEmail(email: string) {
  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: '¡Bienvenido a Diario de un Instante! 🌸',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bienvenido</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { font-size: 24px; font-weight: bold; color: #7c3aed; }
              .content { background: #f9fafb; border-radius: 8px; padding: 30px; margin-bottom: 20px; }
              .feature { background: white; border-left: 3px solid #7c3aed; padding: 15px; margin: 10px 0; }
              .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; }
              .button:hover { background: #6d28d9; }
              .footer { text-align: center; font-size: 12px; color: #6b7280; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">🌸 Diario de un Instante</div>
              </div>

              <div class="content">
                <h1>¡Estás dentro! 🎉</h1>
                <p>Bienvenido a <strong>Diario de un Instante</strong>. Me alegra mucho que te hayas unido.</p>

                <p>A partir de ahora recibirás:</p>

                <div class="feature">
                  <strong>✨ Instantes seleccionados</strong><br>
                  Lo mejor de cada área de mi vida, directamente en tu inbox.
                </div>

                <div class="feature">
                  <strong>💭 Pensamientos y reflexiones</strong><br>
                  Ideas para cultivar una vida más consciente y con propósito.
                </div>

                <div class="feature">
                  <strong>🌱 Actualizaciones exclusivas</strong><br>
                  Novedades y contenido que no comparto en redes sociales.
                </div>

                <p style="margin-top: 30px;">
                  Mientras tanto, te invito a explorar el jardín digital:
                </p>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${BASE_URL}" class="button">Explorar el diario</a>
                </div>

                <p style="font-size: 14px; color: #666;">
                  Sin spam, solo contenido valioso cuando haya novedades interesantes.<br>
                  Puedes darte de baja en cualquier momento desde el enlace al final de cada email.
                </p>
              </div>

              <div class="footer">
                <p>Diario de un Instante - Un jardín digital para cultivar una vida más consciente</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log(`[Email] Welcome enviado a ${email}`);
  } catch (error) {
    console.error('[Email] Error enviando welcome:', error);
    throw error;
  }
}

/**
 * Enviar newsletter a suscriptores
 */
export async function sendNewsletter(
  to: string[],
  subject: string,
  htmlContent: string,
  unsubscribeToken: string
) {
  try {
    const results = await Promise.allSettled(
      to.map((email) =>
        getResend().emails.send({
          from: FROM_EMAIL,
          to: email,
          subject,
          html: htmlContent,
        })
      )
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    console.log(`[Email] Newsletter enviados: ${successful} exitosos, ${failed} fallidos`);

    return { successful, failed, total: to.length };
  } catch (error) {
    console.error('[Email] Error enviando newsletter:', error);
    throw error;
  }
}

/**
 * Generar HTML de newsletter con footer de unsubscribe
 */
export function generateNewsletterHTML(
  title: string,
  content: string,
  unsubscribeUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb; }
          .logo { font-size: 24px; font-weight: bold; color: #7c3aed; }
          .content { margin-bottom: 20px; }
          .footer { text-align: center; font-size: 12px; color: #6b7280; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
          .unsubscribe { color: #dc2626; text-decoration: none; }
          .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🌸 Diario de un Instante</div>
          </div>

          <div class="content">
            <h1>${title}</h1>
            ${content}
          </div>

          <div class="footer">
            <p>Diario de un Instante - Un jardín digital para cultivar una vida más consciente</p>
            <p style="margin-top: 10px;">
              <a href="${unsubscribeUrl}" class="unsubscribe">Darse de baja</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}
