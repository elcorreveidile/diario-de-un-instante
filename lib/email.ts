import { Resend } from 'resend';

const FROM_EMAIL = 'Diario de un Instante <newsletter@diariodeuninstante.com>';
const BASE_URL = 'https://www.diariodeuninstante.com';

let resendInstance: Resend | null = null;

function getResend() {
  if (!resendInstance) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not defined');
    }
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;

export async function sendConfirmationEmail(
  email: string,
  token: string
): Promise<void> {
  try {
    const confirmUrl = `${BASE_URL}/newsletter/confirm?token=${token}`;

    await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Confirma tu suscripción',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { font-size: 24px; font-weight: bold; color: #7c3aed; }
              .content { background: #f9fafb; border-radius: 8px; padding: 30px; }
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
                <h1>Confirma tu suscripción</h1>
                <p>Gracias por suscribirte al newsletter de Diario de un Instante.</p>
                <p>Por favor, confirma tu email haciendo clic en el siguiente botón:</p>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${confirmUrl}" class="button">Confirmar suscripción</a>
                </div>

                <p style="font-size: 14px; color: #666;">
                  Si no te suscribiste, puedes ignorar este email.
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

export async function sendWelcomeEmail(email: string): Promise<void> {
  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: '¡Bienvenido a Diario de un Instante!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { font-size: 24px; font-weight: bold; color: #7c3aed; }
              .content { background: #f9fafb; border-radius: 8px; padding: 30px; }
              .footer { text-align: center; font-size: 12px; color: #6b7280; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">🌸 Diario de un Instante</div>
              </div>

              <div class="content">
                <h1>¡Bienvenido! 🎉</h1>
                <p>Has confirmado tu suscripción al newsletter de Diario de un Instante.</p>
                <p>Recibirás actualizaciones sobre nuevos instantes, reflexiones y momentos compartidos por nuestra comunidad.</p>
                <p>¡Gracias por ser parte de este proyecto!</p>
              </div>

              <div class="footer">
                <p>Diario de un Instante - Un jardín digital para cultivar una vida más consciente</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log(`[Email] Bienvenida enviada a ${email}`);
  } catch (error) {
    console.error('[Email] Error enviando bienvenida:', error);
    throw error;
  }
}

export async function sendNewsletter(
  to: string[],
  subject: string,
  htmlContent: string,
  unsubscribeToken: string
): Promise<{ sent: number; failed: number }> {
  const results = await Promise.allSettled(
    to.map(email =>
      getResend().emails.send({
        from: FROM_EMAIL,
        to: email,
        subject,
        html: htmlContent,
      })
    )
  );

  const sent = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  console.log(`[Email] Newsletter enviado: ${sent} éxito, ${failed} fallidos`);

  return { sent, failed };
}

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
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #7c3aed; }
          .content { background: #f9fafb; border-radius: 8px; padding: 30px; }
          .footer { text-align: center; font-size: 12px; color: #6b7280; margin-top: 30px; }
          .unsubscribe { color: #7c3aed; }
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
            <p><a href="${unsubscribeUrl}" class="unsubscribe">Darse de baja</a></p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function sendCommentNotification(
  userEmail: string,
  instanteTitulo: string,
  commentContent: string,
  commentAuthorName: string,
  instanteUrl: string
): Promise<void> {
  try {
    const excerpt = commentContent.length > 150
      ? commentContent.substring(0, 150) + '...'
      : commentContent;

    await getResend().emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: `💬 Nuevo comentario en "${instanteTitulo}"`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { font-size: 24px; font-weight: bold; color: #7c3aed; }
              .content { background: #f9fafb; border-radius: 8px; padding: 30px; margin-bottom: 20px; }
              .comment-box { background: white; border-left: 3px solid #7c3aed; padding: 15px; margin: 20px 0; font-style: italic; }
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
                <h1>💬 Nuevo comentario</h1>
                <p>Hola,</p>
                <p><strong>${commentAuthorName}</strong> dejó un comentario en tu instante:</p>

                <p style="margin-top: 10px; font-weight: 500;">"${instanteTitulo}"</p>

                <div class="comment-box">
                  "${excerpt}"
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${instanteUrl}" class="button">Ver comentario</a>
                </div>

                <p style="font-size: 14px; color: #666;">
                  Puedes responder al comentario directamente en la página del instante.
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

    console.log(`[Email] Notificación de comentario enviada a ${userEmail}`);
  } catch (error) {
    console.error('[Email] Error enviando notificación de comentario:', error);
    throw error;
  }
}

export async function sendCommentReplyNotification(
  parentCommentAuthorEmail: string,
  parentCommentAuthorName: string,
  replyContent: string,
  replierName: string,
  instanteTitle: string,
  instanteUrl: string
): Promise<void> {
  try {
    const excerpt = replyContent.length > 150
      ? replyContent.substring(0, 150) + '...'
      : replyContent;

    await getResend().emails.send({
      from: FROM_EMAIL,
      to: parentCommentAuthorEmail,
      subject: `💬 Nueva respuesta en "${instanteTitle}"`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { font-size: 24px; font-weight: bold; color: #7c3aed; }
              .content { background: #f9fafb; border-radius: 8px; padding: 30px; margin-bottom: 20px; }
              .reply-box { background: white; border-left: 3px solid #7c3aed; padding: 15px; margin: 20px 0; font-style: italic; }
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
                <h1>💬 Nueva respuesta</h1>
                <p>Hola <strong>${parentCommentAuthorName}</strong>,</p>
                <p><strong>${replierName}</strong> respondió a tu comentario en:</p>

                <p style="margin-top: 10px; font-weight: 500;">"${instanteTitle}"</p>

                <div class="reply-box">
                  "${excerpt}"
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${instanteUrl}" class="button">Ver respuesta</a>
                </div>

                <p style="font-size: 14px; color: #666;">
                  Puedes seguir la conversación directamente en la página del instante.
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

    console.log(`[Email] Notificación de respuesta enviada a ${parentCommentAuthorEmail}`);
  } catch (error) {
    console.error('[Email] Error enviando notificación de respuesta:', error);
    throw error;
  }
}

// ============================================================================
// WEEKLY SUMMARY EMAIL (v0.8)
// ============================================================================

export async function sendWeeklySummaryEmail(
  userEmail: string,
  userName: string,
  stats: {
    thisWeek: {
      totalInstantes: number;
      instantes: any[];
      areasCount: Record<string, number>;
      racha: number;
    };
    lastWeek: {
      totalInstantes: number;
    };
    topPalabra: string;
    areasDescuidadas: string[];
  }
): Promise<void> {
  try {
    const areaEmojis: Record<string, string> = {
      trabajo: '💼',
      salud: '💪',
      relaciones: '❤️',
      aprendizaje: '📚',
      dinero: '💰',
      espiritualidad: '🧘',
      entretenimiento: '🎮',
      entorno: '🏠',
      creatividad: '🎨',
      tecnologia: '💻',
      viajes: '✈️'
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 24px; }
          .header h1 { margin: 0; font-size: 24px; }
          .header p { margin: 8px 0 0 0; opacity: 0.9; }
          .card { background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 16px; }
          .stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 16px 0; }
          .stat { background: white; padding: 16px; border-radius: 8px; text-align: center; }
          .stat-value { font-size: 32px; font-weight: bold; color: #7c3aed; }
          .stat-label { font-size: 14px; color: #6b7280; margin-top: 4px; }
          .instante-list { margin: 16px 0; }
          .instante-item { background: white; padding: 12px; border-radius: 6px; margin-bottom: 8px; border-left: 3px solid #7c3aed; }
          .area-badge { display: inline-block; padding: 4px 8px; background: #ede9fe; color: #5b21b6; border-radius: 12px; font-size: 12px; margin-right: 8px; }
          .comparison { color: ${stats.thisWeek.totalInstantes > stats.lastWeek.totalInstantes ? '#059669' : '#dc2626'}; font-weight: 600; }
          .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Tu Resumen Semanal</h1>
            <p>Hola ${userName}, aquí está tu actividad de esta semana</p>
          </div>

          <div class="card">
            <h2 style="margin: 0 0 16px 0; font-size: 18px;">📈 Esta Semana</h2>
            <div class="stat-grid">
              <div class="stat">
                <div class="stat-value">${stats.thisWeek.totalInstantes}</div>
                <div class="stat-label">Instantes</div>
              </div>
              <div class="stat">
                <div class="stat-value">${stats.thisWeek.racha}🔥</div>
                <div class="stat-label">Racha</div>
              </div>
            </div>
            <p style="text-align: center; color: #6b7280;">
              La semana pasada: ${stats.lastWeek.totalInstantes} instantes
              <span class="comparison">
                ${stats.thisWeek.totalInstantes > stats.lastWeek.totalInstantes ? '↑' : '↓'}
                ${Math.abs(stats.thisWeek.totalInstantes - stats.lastWeek.totalInstantes)}
              </span>
            </p>
          </div>

          ${stats.thisWeek.totalInstantes > 0 ? `
          <div class="card">
            <h2 style="margin: 0 0 16px 0; font-size: 18px;">📝 Tus Instantes</h2>
            <div class="instante-list">
              ${stats.thisWeek.instantes.slice(0, 5).map((instante: any) => `
                <div class="instante-item">
                  <span class="area-badge">${areaEmojis[instante.area] || '📌'} ${instante.area}</span>
                  <strong>${instante.titulo}</strong>
                  <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
                    ${new Date(instante.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}

          ${stats.topPalabra ? `
          <div class="card">
            <h2 style="margin: 0 0 8px 0; font-size: 18px;">💡 Tu Palabra Más Usada</h2>
            <p style="font-size: 24px; font-weight: bold; color: #7c3aed; text-align: center;">"${stats.topPalabra}"</p>
          </div>
          ` : ''}

          ${stats.areasDescuidadas.length > 0 ? `
          <div class="card">
            <h2 style="margin: 0 0 8px 0; font-size: 18px;">⚠️ Áreas Descuidadas</h2>
            <p style="font-size: 14px; color: #6b7280;">Hace más de 30 días que no escribes sobre:</p>
            <div style="margin-top: 8px;">
              ${stats.areasDescuidadas.map((area: string) => `
                <span class="area-badge">${areaEmojis[area] || '📌'} ${area}</span>
              `).join('')}
            </div>
          </div>
          ` : ''}

          <div class="footer">
            <p>Sigue escribiendo tu historia en <a href="https://www.diariodeuninstante.com" style="color: #7c3aed;">diariodeuninstante.com</a></p>
            <p style="margin-top: 8px;">Si no quieres recibir estos emails, puedes configurarlo en tu panel de administración</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await getResend().emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: '📊 Tu resumen semanal - Diario de un Instante',
      html,
    });

    console.log(`[Email] Resumen semanal enviado a ${userEmail}`);
  } catch (error) {
    console.error('[Email] Error enviando resumen semanal:', error);
    throw error;
  }
}
